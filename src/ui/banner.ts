import gradient from 'gradient-string';
import boxen from 'boxen';
import chalk from 'chalk';

const VERSION = '1.0.0';

const cyanBlue = gradient(['#06b6d4', '#3b82f6', '#6366f1']);

export function showBanner(): void {
  const title = cyanBlue('⚡ cpp-perf-audit');
  const subtitle = chalk.dim('C++ Performance & Safety Analysis');
  const version = chalk.dim(`v${VERSION}`);

  const banner = boxen(
    `${title}  ${version}\n${subtitle}`,
    {
      padding: { top: 1, bottom: 1, left: 3, right: 3 },
      borderStyle: 'double',
      borderColor: 'cyan',
      dimBorder: true,
    }
  );

  console.log();
  console.log(banner);
  console.log();
}

export function showCompletionBanner(score: number): void {
  let emoji: string;
  let message: string;

  if (score >= 90) {
    emoji = '🏆';
    message = 'Excellent! Your C++ code follows safety and performance best practices.';
  } else if (score >= 75) {
    emoji = '👍';
    message = 'Good shape! A few safety or performance improvements possible.';
  } else if (score >= 50) {
    emoji = '⚠️';
    message = 'Safety or performance issues detected. Review the findings below.';
  } else {
    emoji = '🔴';
    message = 'Critical safety issues found. Prioritize memory safety and UB fixes.';
  }

  console.log(`\n  ${emoji} ${chalk.bold(message)}\n`);
}

export { VERSION };
