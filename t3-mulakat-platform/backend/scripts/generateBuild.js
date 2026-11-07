const fs = require("fs").promises;
const path = require("path");

const generateBuild = async () => {
    let importsStr = `import Router from \"koa-router\"\nimport m from "@/middlewares/executeNodes"`;
    let routesStr = "const router = new Router<{}, Context>();";

    const rawData = await fs.readFile(
        path.join(__dirname, "../flow-config.json"),
        "utf8"
    );
    // Parse the JSON data
    const flows = JSON.parse(rawData);

    const nodeFunctions = {};

    for (let index = 0; index < flows.length; index++) {
        const flow = flows[index];

        for (let i = 0; i < flow.endpoints.length; i++) {
            const endpoint = flow.endpoints[i];
            routesStr += `\nrouter.${endpoint.method?.toLowerCase()}("${endpoint.name
                }",m(${endpoint.nodes
                    .map((node) => {
                        const funcName = node?.name?.replaceAll("/", "")

                        if (typeof node?.options !== "undefined") {
                            return `(ctx: Context) => ${funcName}(ctx, ${JSON.stringify(node?.options, null, 2)})`
                        }
                        return funcName
                    }
                    )
                    .join(",")}))`;
            for (let _i = 0; _i < endpoint.nodes.length; _i++) {
                const node = endpoint.nodes[_i];
                if (!nodeFunctions[node.name]) {
                    nodeFunctions[node.name] = node.name;
                    importsStr += `\nimport ${node.name?.replaceAll(
                        "/",
                        ""
                    )} from "@/functions/${node.name}"`;
                }
            }
        }
    }
    routesStr += `\nexport default router`;

    await fs.writeFile(
        path.join(__dirname, "../routes.ts"),
        `${importsStr}\n${routesStr}`
    );

    console.log(importsStr);
    console.log(routesStr);
};

generateBuild();