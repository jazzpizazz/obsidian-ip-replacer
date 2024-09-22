const { PluginSettingTab, Plugin, Setting } = require('obsidian');

class IPReplacerPlugin extends Plugin {
  ipAddress = '127.0.0.1';
  toReplace = 'ATTACKER_IP';

  async onload() {
    console.log('IP Replacer Loaded');
    this.addSettingTab(new IPReplacerSettingTab(this.app, this));
    this.registerMarkdownPostProcessor((element, context) => {
      const replaceRegexp = new RegExp(this.toReplace, 'g');
      element.querySelectorAll('*').forEach(el => {
        el.innerHTML = el.innerHTML.replace(replaceRegexp, this.ipAddress);
      });
    });
  }

  setIPAddress(newIP) {
    this.ipAddress = newIP;
  }

  setToReplace(newToReplace) {
    this.toReplace = newToReplace;
  }

  onunload() {
    console.log('IP Replacer Unloaded');
  }
}

class IPReplacerSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;

    containerEl.empty();
    containerEl.createEl('h2', { text: 'IP Replacer Settings' });
 
    new Setting(containerEl)
      .setName('IP to Replace')
      .setDesc('The IP or placeholder to be replaced.')
      .addText(text => text
        .setPlaceholder('Enter a string or regexp')
        .setValue(this.plugin.toReplace)
        .onChange(async (value) => {
          this.plugin.setToReplace(value);
        }));

    new Setting(containerEl)
      .setName('IP Address')
      .setDesc('The IP to replace your placeholder with')
      .addText(text => text
        .setPlaceholder('Enter IP address')
        .setValue(this.plugin.ipAddress)
        .onChange(async (value) => {
          this.plugin.setIPAddress(value);
        }));
  }
}

module.exports = IPReplacerPlugin;
