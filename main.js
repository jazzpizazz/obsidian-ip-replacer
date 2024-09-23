const { PluginSettingTab, Plugin, Setting, Notice, MarkdownView } = require('obsidian');
const { networkInterfaces } = require('os');

class IPReplacerPlugin extends Plugin {
  networkInterfaces = {};

  async onload() {
    console.log('IP Replacer Loaded');

    await this.loadSettings();

    this.refreshInterfaces();
    this.addSettingTab(new IPReplacerSettingTab(this.app, this));
    this.registerMarkdownPostProcessor((element, context) => {
      const replaceRegexp = new RegExp(this.placeholder, 'g');
      const resolvedIP = this.resolveReplacementIP();
      element.querySelectorAll('*').forEach(el => {
        el.innerHTML = el.innerHTML.replace(replaceRegexp, resolvedIP);
      });
    });
  }

  refreshInterfaces() {
    this.networkInterfaces = networkInterfaces();
    this.refreshPreview();
    new Notice('IP Replacer: Network interfaces refreshed');
  }

  resolveReplacementIP() {
    const networkInterface = this.networkInterfaces[this.replacement];
    if (networkInterface) {
      const ipV4Info = networkInterface.find(info => info.family === 'IPv4');
      if (ipV4Info) {
        return ipV4Info.address;
      }
      const ipV6Info = networkInterface.find(info => info.family === 'IPv6');
      if (ipV6Info) {
        return ipV6Info.address;
      }

    }
    return this.replacement;
  }

  setReplacement(newReplacement) {
    this.replacement = newReplacement;
    this.saveSettings();
  }

  setPlaceholder(newPlaceholder) {
    this.placeholder = newPlaceholder;
    this.saveSettings();
  }

  refreshPreview() {
    this.app.workspace.getLeavesOfType("markdown").forEach(leaf => {
      const view = leaf.view;
      if (view instanceof MarkdownView) {
        view.previewMode.rerender(true);
      }
    });
  }

  async loadSettings() {
    const data = await this.loadData();
    this.placeholder = data?.placeholder ?? 'ATTACKER_IP';
    this.replacement = data?.replacement ?? 'lo';
  }

  async saveSettings() {
    await this.saveData({
      placeholder: this.placeholder,
      replacement: this.replacement,
    });
    this.refreshPreview();
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
      .setName('Placeholder')
      .setDesc('The IP or placeholder to be replaced.')
      .addText(text => text
        .setPlaceholder('Enter a string or regexp')
        .setValue(this.plugin.placeholder)
        .onChange(async (value) => {
          this.plugin.setPlaceholder(value);
        }));

    new Setting(containerEl)
      .setName('Replacement')
      .setDesc('Will replace the placeholder. Can be an interface (tun0) or an ip.')
      .addText(text => text
        .setPlaceholder('Enter IP address')
        .setValue(this.plugin.replacement)
        .onChange(async (value) => {
          this.plugin.setReplacement(value);
        }));

    new Setting(containerEl)
      .setName('Refresh Interfaces')
      .setDesc('Reload the available network interfaces. Should be used when the interface did not yet exist when obsidian started.')
      .addButton(button => {
        button.setButtonText('Refresh')
          .setCta()
          .onClick(() => {
            this.plugin.refreshInterfaces();
          });
      });
  }
}

module.exports = IPReplacerPlugin;
