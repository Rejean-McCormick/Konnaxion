@echo off
setlocal
set VIDEO=cinematic\tours\ethikos-v413\output-preview\browser.webm
set AUDIO=cinematic\tours\ethikos-v413\narration-preview-silence.mp3
set ASS=cinematic\tours\ethikos-v413\ethikos-overlay-preview.ass
set OUT=cinematic\tours\ethikos-v413\output-preview\final-overlay.mp4
ffmpeg -y -i "%VIDEO%" -i "%AUDIO%" -vf "ass='%ASS%'" -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest "%OUT%"
echo.
echo Output: %OUT%
endlocal
