@echo off
setlocal

pushd "%~dp0frontend"

call corepack enable
call pnpm install
call pnpm dev

popd
endlocal