cd /mnt/e/pen117page
/usr/bin/python3 updateM/updateList.py
git add .
TODAY=$(date +"%Y-%m-%d")
git commit -m  $TODAY
git push
# sleep 2m