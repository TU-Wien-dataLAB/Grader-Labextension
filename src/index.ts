import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { requestAPI } from './handler';

/**
 * Initialization data for the grader-labextension extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'grader-labextension:plugin',
  description: 'Grader Labextension is a JupyterLab extension to enable automatic grading of assignment notebooks.',
  autoStart: true,
  optional: [ISettingRegistry],
  activate: (app: JupyterFrontEnd, settingRegistry: ISettingRegistry | null) => {
    console.log('JupyterLab extension grader-labextension is activated!');

    if (settingRegistry) {
      settingRegistry
        .load(plugin.id)
        .then(settings => {
          console.log('grader-labextension settings loaded:', settings.composite);
        })
        .catch(reason => {
          console.error('Failed to load settings for grader-labextension.', reason);
        });
    }

    requestAPI<any>('get-example')
      .then(data => {
        console.log(data);
      })
      .catch(reason => {
        console.error(
          `The grader_labextension server extension appears to be missing.\n${reason}`
        );
      });
  }
};

export default plugin;
