/**
 * Returns the name with which `@use` reads a module input file,
 * or `undefined` for a file that is no module
 *
 * The directories of the resource name become the parts of the module name:
 * `@use graph::closure` reads the input file `graph/closure.rls`.
 */
export function moduleNameOf(resource: string): string | undefined {
  if (!resource.endsWith(".rls")) {
    return undefined;
  }
  return resource
    .slice(0, -".rls".length)
    .replace(/^\.\//, "")
    .split("/")
    .join("::");
}
