"""Security regression tests for private school projects (run in Django CI)."""
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory, force_authenticate

from konnaxion.keenkonnect.api_views import (
    ProjectViewSet, ProjectMessageViewSet, ProjectResourceViewSet,
    ProjectTaskViewSet, ProjectTeamViewSet, ProjectRatingViewSet,
)
from konnaxion.keenkonnect.models import Project, ProjectMessage, ProjectTask, ProjectTeam


@pytest.fixture
def people(db):
    User = get_user_model()
    teacher = User.objects.create_user(username='teacher_kidaxion', password='fake-only')
    teacher.is_staff = True
    teacher.save(update_fields=['is_staff'])
    pupil = User.objects.create_user(username='pupil_kidaxion', password='fake-only')
    stranger = User.objects.create_user(username='stranger_kidaxion', password='fake-only')
    school = Project.objects.create(title='Classe test', description='Privé', category='ekole.school', creator=teacher)
    public = Project.objects.create(title='Autre projet', description='Public', category='community', creator=teacher)
    ProjectTeam.objects.create(project=school,user=pupil,role='collaborator')
    ProjectMessage.objects.create(project=school,author=pupil,content='J’ai besoin d’aide pour cette activité.')
    ProjectTask.objects.create(project=school,title='Legacy task only')
    return teacher,pupil,stranger,school,public


def request(viewset, method, action, data=None, user=None, pk=None):
    factory=APIRequestFactory()
    req=getattr(factory,method)('/api/test/',data=data,format='json')
    if user is not None: force_authenticate(req,user=user)
    actions={method:action}
    if pk is None:return viewset.as_view(actions)(req)
    return viewset.as_view(actions)(req,pk=pk)


@pytest.mark.django_db
def test_school_hidden_for_anonymous_and_unrelated(people):
    teacher,pupil,stranger,school,public=people
    anon=request(ProjectViewSet,'get','list')
    nonmember=request(ProjectViewSet,'get','list',user=stranger)
    member=request(ProjectViewSet,'get','list',user=pupil)
    for result in (anon,nonmember):
        assert school.id not in [row['id'] for row in result.data]
        assert public.id in [row['id'] for row in result.data]
    assert school.id in [row['id'] for row in member.data]
    assert request(ProjectViewSet,'get','retrieve',user=stranger,pk=school.id).status_code==404


@pytest.mark.django_db
def test_school_children_hidden_across_all_endpoints(people):
    _,pupil,stranger,school,_=people
    for viewset in (ProjectMessageViewSet,ProjectResourceViewSet,ProjectTaskViewSet,ProjectTeamViewSet,ProjectRatingViewSet):
        guest=request(viewset,'get','list',user=stranger)
        assert guest.status_code==200
        assert all(row.get('project') != school.id for row in guest.data)
        assert request(viewset,'get','list',user=pupil).status_code==200


@pytest.mark.django_db
def test_school_project_creation_requires_staff(people):
    teacher,pupil,_,_,_=people
    data={'title':'Une classe', 'description':'privée','category':'EKOLE.SCHOOL'}
    assert request(ProjectViewSet,'post','create',data=data,user=pupil).status_code==403
    assert request(ProjectViewSet,'post','create',data=data,user=teacher).status_code==201


@pytest.mark.django_db
def test_school_canned_messages_and_no_shadow_tasks(people):
    teacher,pupil,stranger,school,_=people
    invalid={'project':school.id,'content':'L’indice secret est ...'}
    valid={'project':school.id,'content':'J’ai besoin d’aide pour cette activité.'}
    assert request(ProjectMessageViewSet,'post','create',data=invalid,user=pupil).status_code==400
    assert request(ProjectMessageViewSet,'post','create',data=valid,user=stranger).status_code==403
    assert request(ProjectMessageViewSet,'post','create',data=valid,user=pupil).status_code==201
    assert request(ProjectTaskViewSet,'post','create',data={'project':school.id,'title':'Shadow task'},user=teacher).status_code==403


@pytest.mark.django_db
def test_school_membership_is_not_self_signup(people):
    teacher,pupil,stranger,school,_=people
    data={'project_ref':school.id,'user_ref':stranger.id,'role':'collaborator'}
    assert request(ProjectTeamViewSet,'post','create',data=data,user=pupil).status_code==403
    assert request(ProjectTeamViewSet,'post','create',data=data,user=teacher).status_code==201

@pytest.mark.django_db
def test_school_member_does_not_receive_peer_account_identifiers(people):
    teacher,pupil,stranger,school,_=people
    msg=request(ProjectMessageViewSet,'get','list',user=pupil)
    assert msg.status_code==200
    school_msgs=[m for m in msg.data if m.get('project')==school.id]
    assert school_msgs
    assert all(m['author'] == 'Moi' for m in school_msgs)
    ProjectMessage.objects.create(project=school,author=teacher,content='Je peux aider mon équipe.')
    msg=request(ProjectMessageViewSet,'get','list',user=pupil)
    school_msgs=[m for m in msg.data if m.get('project')==school.id]
    assert any(m['author'] == "Membre de l'équipe" for m in school_msgs)
    members=request(ProjectTeamViewSet,'get','list',user=pupil)
    school_members=[m for m in members.data if m.get('project_id')==school.id]
    assert school_members
    assert all('user_id' not in m for m in school_members)
    assert all(m.get('user') in ('Moi',"Membre de l'équipe") for m in school_members)
