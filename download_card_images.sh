# wands, cups, swords, pentacles
for suit in "wa" "cu" "sw" "pe"; do
  # ace, 1-10, page, knight, queen, king
  for i in "ac" "02" "03" "04" "05" "06" "07" "08" "09" "10" "pa" "kn" "qu" "ki"; do
    filename=$suit$i.jpg
    if [ ! -e ./$filename ]; then
      wget "http://www.sacred-texts.com/tarot/pkt/img/$filename"
    fi
  done
done

# major arcana
for i in "00" "01" "02" "03" "04" "05" "06" "07" "08" "09" "10" "11" "12" "13" "14" "15" "16" "17" "18" "19" "20" "21"; do
  filename=ar$i.jpg
  if [ ! -e ./$filename ]; then
    wget "http://www.sacred-texts.com/tarot/pkt/img/$filename"
  fi
done