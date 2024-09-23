# IP Replacer
Obsidian plugin for quickly replacing IPs in notes without editing your files.
### Installation
Haven't tried but I guess you just:
`git clone git@github.com:jazzpizazz/ip-replacer.git` inside of your `.obsidian/plugins/`.

### Configure
Just set your placeholder and IP. You can also set the name of an interface (for example `tun0`) and the plugin
will use its IP. If the interface did not yet exist when obisidian was started you will see the name of the interface in your notes,
in that case use `Refresh Interfaces` to make the plugin recheck your interfaces.
![image](https://github.com/user-attachments/assets/413a4ef2-b0f1-4a89-bc95-07b02f37685b)

### Only replaces in preview mode
![image](https://github.com/user-attachments/assets/0c69c7e9-3955-44aa-a488-a430977b942b)
![image](https://github.com/user-attachments/assets/62ea5fda-58e5-4518-a191-fa530fd71a07)
### Notes
- Currently requires you to reopen a note after changing the settings, should be fixed
- Not sure if the settings are persistent yet, if not this will also be fixed
