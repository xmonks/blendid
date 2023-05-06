// Grouped by what can run in parallel
const assetTasks = ["cloudinary", "fonts", "iconFont", "images"];
const codeTasks = ["esbuild", "stylesheets", "javascripts"];

export default function (taskConfig) {
  function findExistingTasks(candidates) {
    const tasks = candidates.filter((x) => taskConfig[x]);
    return tasks.length ? tasks : null;
  }

  return {
    assetTasks: findExistingTasks(assetTasks),
    codeTasks: findExistingTasks(codeTasks),
  };
}
