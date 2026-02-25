import ora, { type Ora } from 'ora';
import { Listr } from 'listr2';
import chalk from 'chalk';

export function createSpinner(text: string): Ora {
  return ora({
    text,
    color: 'cyan',
    spinner: 'dots',
  });
}

export interface TaskDefinition<C> {
  title: string;
  task: (ctx: C) => Promise<void>;
}

export function createTaskList<C extends object>(tasks: TaskDefinition<C>[]): Listr<C> {
  return new Listr<C>(
    tasks.map((t) => ({
      title: t.title,
      task: async (ctx: C) => {
        await t.task(ctx);
      },
    })),
    {
      concurrent: false,
      rendererOptions: {
        collapseSubtasks: false,
        collapseErrors: false,
      },
    }
  );
}

export function logStep(step: string, detail?: string): void {
  const prefix = chalk.cyan('▸');
  const msg = detail
    ? `${prefix} ${chalk.bold(step)} ${chalk.dim(detail)}`
    : `${prefix} ${chalk.bold(step)}`;
  console.log(msg);
}
