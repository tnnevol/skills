import { HaloError } from "./client.mjs";
import { commands as postCommands } from "./post-actions.mjs";
import { commands as tagCommands } from "./tag-actions.mjs";
import { commands as categoryCommands } from "./category-actions.mjs";
import { commands as singlepageCommands } from "./singlepage-actions.mjs";

/**
 * Merge all module commands into a single registry
 */
const commandRegistry = {
  ...postCommands,
  ...tagCommands,
  ...categoryCommands,
  ...singlepageCommands,
};

/**
 * Execute a halo action based on the parsed command
 * @param {Object} clients - API clients (console and ext)
 * @param {string} action - Action name
 * @param {Object} opts - Parsed options
 * @returns {Promise<string>} Result message
 */
export async function executeAction(clients, action, opts) {
  const cmd = commandRegistry[action];

  if (!cmd) {
    throw new HaloError(`未知操作: ${action}`);
  }

  // Run validation if defined
  if (cmd.validate) {
    cmd.validate(opts);
  }

  // Execute the command
  return cmd.execute(clients, opts);
}

/**
 * Get all registered commands for help display
 * @returns {Array} Array of {name, description, usage}
 */
export function getCommandHelp() {
  return Object.entries(commandRegistry).map(([name, cmd]) => ({
    name,
    description: cmd.description,
    usage: cmd.usage,
  }));
}

/**
 * Format options array into display strings
 * @param {Array} options - Array of option objects
 * @returns {Array} Array of formatted strings
 */
function formatOptions(options) {
  if (!options || options.length === 0) return [];

  return options.map((opt) => {
    const name = opt.type === "flag" ? `--${opt.name}` : `--${opt.name}=`;
    return `  ${name.padEnd(20)} ${opt.description}`;
  });
}

/**
 * Get help for a specific command
 * @param {string} action - Command name
 * @returns {string} Formatted help text
 */
export function getCommandSpecificHelp(action) {
  const cmd = commandRegistry[action];
  if (!cmd) {
    return null;
  }

  let help = `用法: halo ${cmd.usage}\n\n`;
  help += `${cmd.description}\n\n`;

  const formattedOptions = formatOptions(cmd.options);
  if (formattedOptions.length > 0) {
    help += "Options:\n";
    help += formattedOptions.join("\n");
  } else {
    help += "该命令无需额外选项";
  }

  return help;
}
