import { Command } from '@oclif/command';
import cheerio from 'cheerio';
import cli from 'cli-ux';
import request from 'request-promise-native';

const url = 'https://github.com/microsoft/vscode/commits';

export default class LatestSha extends Command {
  static description = 'get the author, build status, and sha of the latest commit of a given branch';

  static args = [{ name: 'branch' }];

  async run() {
    const { args } = this.parse(LatestSha);
    const branch = args.branch || 'master';

    let body = '';

    cli.action.start('loading commit data');

    try {
      body = await request.get(`${url}/${branch}`);
      cli.action.stop('done\n');
    } catch (error) {
      cli.action.stop('fail\n');
      this.error('unable to load commit data from GitHub');
      this.error(error);
      this.exit(1);
    }

    try {
      const $ = cheerio.load(body);

      const author = $('.commit-author')
        .first()
        .text();

      const build = $('.commit-indicator summary')
        .first()
        .attr('class')
        .replace('text-', '')
        .replace('color-yellow-7', 'yellow');

      const sha = $('.sha')
        .first()
        .text()
        .trim();

      this.log(`Author ${author}, Build: ${build}, SHA: ${sha}`);
    } catch (error) {
      this.error('unable to read commit info from GitHub');
      this.error(error);
      this.exit(1);
    }
  }
}
