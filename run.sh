pkill node

echo "" >> nohup.out
echo "" >> nohup.out
echo "===== STARTING APP =====" >> nohup.out

nohup node --max-old-space-size=100 js/index.js &
sh logs.sh
