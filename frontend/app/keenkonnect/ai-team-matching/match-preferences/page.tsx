// C:\MyCode\Konnaxionv14\frontend\app\keenkonnect\ai-team-matching\match-preferences\page.tsx
'use client';

import { useLanguage } from '@/context/LanguageContext';
import {
  ProFormSelect,
  ProFormSlider,
  ProFormSwitch,
  ProFormTextArea,
  StepsForm,
} from '@ant-design/pro-components';
import { Alert, Card } from 'antd';
import React from 'react';

import KeenPage from '@/app/keenkonnect/KeenPageShell';

const MatchPreferencesPage: React.FC = () => {
  const { t: i18nT } = useLanguage();
  return (
    <KeenPage
      title={i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.preferencesDeMatching")}
      description={i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.configureTesPreferencesPourQueKeenkonnectPuisse")}
    >
      <Alert
        type="info"
        showIcon
        message={i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.matchingPreferencesAreADeclaredPreview")}
        description={i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.youCanExploreThePreferenceModelBut")}
        style={{ marginBottom: 16 }}
      />
      <Card>
        <StepsForm
          containerStyle={{ maxWidth: 840, margin: '0 auto' }}
          onFinish={async () => {
            // Declared preview: no matching-preferences persistence contract exists.
            return false;
          }}
          stepsFormRender={(dom, submitter) => (
            <div>
              {dom}
              <div style={{ marginTop: 24 }}>{submitter}</div>
            </div>
          )}
        >
          {/* Étape 1 — Profil & objectifs */}
          <StepsForm.StepForm
            name="profile"
            title={i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.profilObjectifs")}
            stepProps={{
              description: i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.ceQueTuCherchesDansLEquipe"),
            }}
          >
            <ProFormSelect
              name="matchGoal"
              label={i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.objectifPrincipal")}
              placeholder={i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.choisisTonObjectifPrincipal")}
              rules={[
                {
                  required: true,
                  message: i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.merciDePreciserTonObjectifPrincipal"),
                },
              ]}
              options={[
                { label: i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.trouverUnECofondateurRice"), value: 'cofounder' },
                { label: i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.trouverUneEquipePourUnProjet"), value: 'join_team' },
                { label: i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.trouverDesFreelancesExperts"), value: 'freelance' },
                { label: i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.brainstormNetworkingUniquement"), value: 'networking' },
              ]}
            />

            <ProFormSlider
              name="seniorityPreference"
              label={i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.niveauDExperienceSouhaiteDansLEquipe")}
              min={1}
              max={10}
              marks={{
                1: 'Très junior',
                5: 'Mixte',
                10: 'Très senior',
              }}
              tooltip={{
                formatter: (value?: number) =>
                  value !== undefined ? `${value}/10` : undefined,
              }}
            />

            <ProFormSelect
              name="timeCommitment"
              label={i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.disponibiliteSouhaiteeDesMembres")}
              placeholder={i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.selectionneUneOption")}
              allowClear
              options={[
                { label: i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.sideProject35HSemaine"), value: 'side' },
                { label: i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.engagementModere510HSemaine"), value: 'medium' },
                { label: i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.engagementEleve10hSemaine"), value: 'high' },
              ]}
            />

            <ProFormSwitch
              name="remoteOnly"
              label={i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.jeVeuxUniquementDesCollaborations100A")}
              fieldProps={{
                checkedChildren: 'Oui',
                unCheckedChildren: 'Non',
              }}
            />
          </StepsForm.StepForm>

          {/* Étape 2 — Style d’équipe */}
          <StepsForm.StepForm
            name="team"
            title={i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.styleDEquipe")}
            stepProps={{
              description: i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.commentTuAimesTravailler"),
            }}
          >
            <ProFormSlider
              name="teamSize"
              label={i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.tailleDEquipeIdeale")}
              min={2}
              max={12}
              marks={{
                2: 'Très lean',
                5: 'Équipe moyenne',
                10: 'Grosse équipe',
              }}
            />

            <ProFormSelect
              name="communicationStyle"
              label={i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.styleDeCommunicationPrefere")}
              placeholder={i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.selectionneCeQuiTeRessembleLePlus")}
              options={[
                {
                  label: i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.tresStructureNotesComptesRendusSuiviSerre"),
                  value: 'structured',
                },
                { label: i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.flexibleMaisReactif"), value: 'flexible' },
                { label: i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.informelAuFeeling"), value: 'casual' },
              ]}
            />

            <ProFormSlider
              name="asyncPreference"
              label={i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.preferencePourLeTravailAsynchrone")}
              min={0}
              max={10}
              marks={{
                0: 'Tout en temps réel',
                5: 'Mixte',
                10: 'Quasi 100% asynchrone',
              }}
            />

            <ProFormSwitch
              name="needsFacilitator"
              label={i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.jePrefereQuIlYAitUn")}
              fieldProps={{
                checkedChildren: 'Oui',
                unCheckedChildren: 'Pas nécessaire',
              }}
            />

            <ProFormSwitch
              name="preferDiverseBackgrounds"
              label={i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.jeSouhaiteUneEquipeAvecDesProfils")}
              fieldProps={{
                checkedChildren: 'Oui',
                unCheckedChildren: 'Peu importe',
              }}
            />
          </StepsForm.StepForm>

          {/* Étape 3 — Contraintes & priorités */}
          <StepsForm.StepForm
            name="constraints"
            title={i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.contraintesPriorites")}
            stepProps={{
              description: i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.ceQuiEstNonNegociablePourToi"),
            }}
          >
            <ProFormSlider
              name="timeZoneOverlap"
              label={i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.chevauchementHoraireMinimumSouhaite")}
              min={0}
              max={8}
              marks={{
                0: 'Peu importe',
                2: '2h',
                4: '4h',
                6: '6h',
                8: '8h+',
              }}
              tooltip={{
                formatter: (value?: number) =>
                  value !== undefined ? `${value}h de chevauchement` : undefined,
              }}
            />

            <ProFormSelect
              name="meetingFrequency"
              label={i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.frequenceDeReunionsSouhaitee")}
              placeholder={i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.selectionneUneOption")}
              allowClear
              options={[
                { label: i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.text1FoisParSemaine"), value: 'weekly' },
                { label: i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.text23FoisParSemaine"), value: 'twice_week' },
                { label: i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.quotidienStandUpCourt"), value: 'daily' },
                { label: i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.auBesoinUniquement"), value: 'on_demand' },
              ]}
            />

            <ProFormSwitch
              name="openToWeekend"
              label={i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.okPourTravaillerPonctuellementLeWeekEnd")}
              fieldProps={{
                checkedChildren: 'Oui',
                unCheckedChildren: 'Non',
              }}
            />

            <ProFormSwitch
              name="openToNightSessions"
              label={i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.okPourDesSessionsTardLeSoir")}
              fieldProps={{
                checkedChildren: 'Oui',
                unCheckedChildren: 'Non',
              }}
            />

            <ProFormTextArea
              name="notes"
              label={i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.detailsComplementairesPourLAlgorithmeDeMatching")}
              placeholder={i18nT("ui.keenkonnect.aiTeamMatching.matchPreferences.exJePrefereLesEquipesQuiPrototypent")}
              fieldProps={{
                autoSize: { minRows: 3, maxRows: 6 },
                showCount: true,
                maxLength: 600,
              }}
            />
          </StepsForm.StepForm>
        </StepsForm>
      </Card>
    </KeenPage>
  );
};

export default MatchPreferencesPage;
