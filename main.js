const { PluginSettingTab, Plugin, Setting, Notice, MarkdownView } = require('obsidian');
const { networkInterfaces } = require('os');

class IPReplacerPlugin extends Plugin {
  async onload() {
    console.log('IP Replacer Loaded');

    await this.loadSettings();

    this.refreshInterfaces();
    this.addSettingTab(new IPReplacerSettingTab(this.app, this));

    this.registerMarkdownPostProcessor((element) => {
      this.settings.replacements.forEach(({ placeholder, replacement }) => {
        const replaceRegexp = new RegExp(placeholder, 'g');
        const resolvedIP = this.resolveReplacementIP(replacement);
        element.querySelectorAll('*').forEach(el => {
          el.innerHTML = el.innerHTML.replace(replaceRegexp, resolvedIP);
        });
      });
    });
  }

  refreshInterfaces() {
    this.networkInterfaces = networkInterfaces();
    this.refreshPreview();
    new Notice('IP Replacer: Network interfaces refreshed');
  }

  resolveReplacementIP(replacement) {
    const networkInterface = this.networkInterfaces[replacement];
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
    return replacement;
  }

  async loadSettings() {
    const data = await this.loadData();
    this.settings = data?.settings ?? { replacements: [{ placeholder: 'ATTACKER_IP', replacement: 'lo' }] };
  }

  async saveSettings() {
    await this.saveData({ settings: this.settings });
    this.refreshPreview();
  }

  refreshPreview() {
    this.app.workspace.getLeavesOfType("markdown").forEach(leaf => {
      const view = leaf.view;
      if (view instanceof MarkdownView) {
        view.previewMode.rerender(true);
      }
    });
  }
}

class IPReplacerSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    const plugin = this.plugin;

    containerEl.empty();
    containerEl.createEl('h2', { text: 'IP Replacer Settings' });

    const helperText = containerEl.createEl('p', {
      text: 'Add or modify placeholders and their corresponding replacements. You can use regular expressions for placeholders.'
    })
    helperText.style.color = 'var(--text-muted)';
    helperText.style.fontSize = '12px';

    plugin.settings.replacements.forEach((pair, index) => {
      const settingDiv = containerEl.createDiv();

      new Setting(settingDiv)
        .setName(`Placeholder ${index + 1}`)
        .setDesc('The placeholder to be replaced.')
        .addText(text => text
          .setPlaceholder('Enter a string or regexp')
          .setValue(pair.placeholder)
          .onChange(async (value) => {
            plugin.settings.replacements[index].placeholder = value;
            await plugin.saveSettings();
          }));

      new Setting(settingDiv)
        .setName(`Replacement ${index + 1}`)
        .setDesc('Will replace the placeholder. Can be an interface (tun0) or an ip.')
        .addText(text => text
          .setPlaceholder('Enter IP address or interface')
          .setValue(pair.replacement)
          .onChange(async (value) => {
            plugin.settings.replacements[index].replacement = value;
            await plugin.saveSettings();
          }));

      new Setting(settingDiv)
        .addButton(button => {
          button.setButtonText('Remove')
            .setCta()
            .onClick(async () => {
              plugin.settings.replacements.splice(index, 1);
              await plugin.saveSettings();
              this.display();
            });
          button.buttonEl.style.backgroundColor = 'red';
          button.buttonEl.style.color = 'white';
          button.buttonEl.style.cursor = 'pointer';
        });
    });

    new Setting(containerEl)
      .setName("Add New Replacement")
      .setDesc('Add a new placeholder replacement pair.')
      .addButton(button => {
        button.setButtonText('Add')
          .setCta()
          .onClick(async () => {
            plugin.settings.replacements.push({ placeholder: '', replacement: '' });
            await plugin.saveSettings();
            this.display();
          });
        button.buttonEl.style.cursor = 'pointer';
      });

    new Setting(containerEl)
    .setName('Refresh Interfaces')
    .setDesc('Reload the available network interfaces. Should be used when the interface did not yet exist when obsidian started.')
    .addButton(button => {
      button.setButtonText('Refresh')
        .setCta()
        .onClick(() => {
          this.plugin.refreshInterfaces();
        });
        button.buttonEl.style.cursor = 'pointer';
    });
  
  }
}

module.exports = IPReplacerPlugin;
