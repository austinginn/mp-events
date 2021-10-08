#!/bin/bash
echo "*****Configure Ministry Platform Event Web App****"
echo "Enter the title for your event calendar web app: "
read title

# echo "Enter a description for your event calendar web app: "
# read meta_description

# while true
# do
#  read -r -p "Do you want to host a ics calendar file? [Y/N] " input
 
#  case $input in
#      [yY][eE][sS]|[yY])
#  ics=true
#  break
#  ;;
#      [nN][oO]|[nN])
# ics=false
#  break
#         ;;
#      *)
#  echo "Invalid input..."
#  ;;
#  esac
# done

# while true
# do
#  read -r -p "Do you want to enable emailing ics calendar invites? [Y/N]" input
 
#  case $input in
#      [yY][eE][sS]|[yY])
#  ics_email=true
#  break
#  ;;
#      [nN][oO]|[nN])
# ics_email=false
#  break
#         ;;
#      *)
#  echo "Invalid input..."
#  ;;
#  esac
# done

# while true
# do
#  read -r -p "Do you want to enable webhook updates from Ministry Platform (see readme for more information)? [Y/N]" input
 
#  case $input in
#      [yY][eE][sS]|[yY])
# webhook_update=true
#  break
#  ;;
#      [nN][oO]|[nN])
# webhook_update=false
#  break
#         ;;
#      *)
#  echo "Invalid input..."
#  ;;
#  esac
# done

# while true
# do
#  read -r -p "Do you want to enable scheduled updates from Ministry Platform (see readme for more information)? [Y/N]" input
 
#  case $input in
#      [yY][eE][sS]|[yY])
# scheduled_update=true
#  break
#  ;;
#      [nN][oO]|[nN])
# scheduled_update=false
#  break
#         ;;
#      *)
#  echo "Invalid input..."
#  ;;
#  esac
# done

# while true
# do
#  read -r -p "Do you want to enable an admin portal (see readme for more information)? [Y/N]" input
 
#  case $input in
#      [yY][eE][sS]|[yY])
# debug_portal=true
#  break
#  ;;
#      [nN][oO]|[nN])
# debug_portal=false
#  break
#         ;;
#      *)
#  echo "Invalid input..."
#  ;;
#  esac
# done

# echo "ALL COLOR VALUES MUST BE 6 DIGIT HEX VALUE (#000000)"
# echo "Enter light theme text color: "
# read light_text

# echo "Enter light theme background color: "
# read light_background

# echo "Enter light theme accent color: "
# read light_accent

# echo "Enter dark theme text color: "
# read dark_text

# echo "Enter dark theme background color: "
# read dark_background

# echo "Enter dark theme accent color: "
# read dark_accent

# echo '{
#     "title": "$title",
#     "meta-description": "$meta_description",
#     "ics": "$ics",
#     "ics_email": "$ics_email",
#     "webhook_update": "$webhook_update",
#     "scheduled_update": "$scheduled_update",
#     "debug_portal": "$debug_portal",
#     "light_theme": {
#         "text": "$light_text",
#         "background": "$light_background",
#         "header": "$light_accent"
#     },
#     "dark_theme": {
#         "text": "$dark_text",
#         "background": "$dark_background",
#         "header": "$dark_accent"
#     }
# }' > config2.json