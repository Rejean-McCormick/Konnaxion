"""Transactional SHA-256 guarded file overlay for Konnaxion P1 tour.
Standalone Python 3.10+, no repo/test DB import on the host.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import zipfile
from datetime import datetime, timezone

PACK=Path(__file__).resolve().parent
REPO=PACK.parents[1]
META=json.loads((PACK/'manifest.json').read_text(encoding='utf-8'))
BACKUPS=REPO.parent/'Tandem_Local'/'konnaxion_tour_p1'/'backups'

def digest(path):
    if not path.exists(): return None
    return hashlib.sha256(path.read_bytes()).hexdigest()

def status(item):
    dest=REPO/item['path']
    real=digest(dest)
    if real==item['after_sha256']:return 'ALREADY_UPDATED'
    if real==item['before_sha256']:return 'READY'
    return 'DRIFT'

def preview():
    print('=== KONNAXION / TANDEM / TOUR 1 SUR 8 / P1 ===')
    print('[REPO]',REPO)
    print('[PORTEE] Code local uniquement, aucune DB, service, ni SSO active')
    bad=[]
    for item in META['files']:
        st=status(item)
        print(f'[{st}] {item["path"]}')
        if st=='DRIFT':bad.append(item['path'])
    if bad:
        print('[BLOQUE] Derive du snapshot pour',len(bad),'fichier(s); aucun ecrasement')
        return 2
    print('[OK] Empreintes SHA-256 conformes')
    return 0

def test_staged():
    # Only copied payloads are tested: no external imports/DB/network.
    with tempfile.TemporaryDirectory(prefix='kx_tandem_p1_') as tmp:
        t=Path(tmp)
        for item in META['files']:
            rel=item['path'];dst=t/rel;dst.parent.mkdir(parents=True,exist_ok=True)
            with zipfile.ZipFile(PACK/'payload.zip') as archive:
                data=archive.read(rel)
            if hashlib.sha256(data).hexdigest()!=item['after_sha256']:
                raise ValueError('Payload SHA mismatch: '+rel)
            dst.write_bytes(data)
        files=[item['path'] for item in META['files'] if item['path'].endswith('.py')]
        for rel in files:
            # Compile in-memory, to avoid modifying either tree.
            compile((t/rel).read_bytes(),rel,'exec')
        cmd=[sys.executable,'-B','-m','unittest','discover','-s','tools/tandem_tour/tests','-p','test_*.py','-v']
        result=subprocess.run(cmd,cwd=t,check=False)
        if result.returncode:raise RuntimeError('Standalone P1 contract tests failed')

def install():
    if preview():return 2
    if all(status(x)=='ALREADY_UPDATED' for x in META['files']):
        print('[OK] Deja installe, aucune modification')
        return 0
    print('[TEST] Verification des payloads et contrats sur copie isolee...')
    test_staged()
    # A backup is created before changing any real source.
    BACKUPS.mkdir(parents=True,exist_ok=True)
    stamp=datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
    backup=BACKUPS/stamp
    backup.mkdir()
    to_change=[x for x in META['files'] if status(x)=='READY']
    for item in to_change:
        rel=item['path'];source=REPO/rel
        if source.exists():
            target=backup/'originals'/rel
            target.parent.mkdir(parents=True,exist_ok=True)
            shutil.copy2(source,target)
    (backup/'transaction.json').write_text(json.dumps({'items':to_change},indent=2)+'\n',encoding='utf-8')
    # No concurrency assumptions: recheck digest *at the moment of replacement*.
    done=[]
    try:
        for item in to_change:
            rel=item['path'];dst=REPO/rel
            if status(item)!='READY':raise RuntimeError('Concurrent file modification: '+rel)
            dst.parent.mkdir(parents=True,exist_ok=True)
            with zipfile.ZipFile(PACK/'payload.zip') as archive:
                data=archive.read(rel)
            if hashlib.sha256(data).hexdigest()!=item['after_sha256']:
                raise ValueError('Payload SHA mismatch: '+rel)
            fd,tmp=tempfile.mkstemp(prefix='.tandem-p1-',dir=dst.parent)
            try:
                with os.fdopen(fd,'wb') as f:f.write(data)
                os.replace(tmp,dst)
            finally:
                if os.path.exists(tmp):os.unlink(tmp)
            done.append(item)
        if preview():raise RuntimeError('Post-install source validation failed')
        print('[TEST] Controle post-install sur code livre...')
        test_staged()
    except Exception:
        for item in reversed(done):
            rel=item['path'];dst=REPO/rel
            if digest(dst)==item['after_sha256']:
                backup_src=backup/'originals'/rel
                if backup_src.exists():shutil.copy2(backup_src,dst)
                else:dst.unlink()
        raise
    (BACKUPS/'latest.json').write_text(json.dumps({'backup':stamp},indent=2)+'\n',encoding='utf-8')
    print('[OK] Installe; sauvegarde:',backup)
    print('[INFO] Env reel, Neon, Orgo, 900 personas et VPS inchanges')
    print('[INFO] Tests Django natifs non lances; qualification runtime encore requise')
    return 0

def verify():
    if preview():return 2
    if any(status(x)!='ALREADY_UPDATED' for x in META['files']):
        print('[BLOQUE] Ensemble du correctif non installe');return 2
    print('[TEST] Verification contractuelle autonome')
    test_staged()
    print('[OK] Sources conformes et tests de contrats réussis')
    return 0

def rollback():
    marker=BACKUPS/'latest.json'
    if not marker.exists():
        print('[ATTENTE] Aucun historique de rollback');return 2
    last=json.loads(marker.read_text(encoding='utf-8'))
    backup=BACKUPS/last['backup']
    items=json.loads((backup/'transaction.json').read_text(encoding='utf-8'))['items']
    for item in items:
        if digest(REPO/item['path'])!=item['after_sha256']:
            print('[BLOQUE] Drift post-install:',item['path']);return 2
    for item in reversed(items):
        rel=item['path'];src=backup/'originals'/rel;dst=REPO/rel
        if src.exists():shutil.copy2(src,dst)
        else:dst.unlink()
        assert digest(dst)==item['before_sha256']
    # Do not trash history; clear only pointer.
    marker.unlink()
    print('[OK] Retour arriere; historique conserve:',backup)
    return 0

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('mode',choices=['preview','install','verify','rollback'])
    args=parser.parse_args()
    try:sys.exit(globals()[args.mode]())
    except Exception as exc:
        print('[ERREUR]',type(exc).__name__,str(exc),file=sys.stderr)
        sys.exit(1)
