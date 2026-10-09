import setup from "./setup";
setup().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
