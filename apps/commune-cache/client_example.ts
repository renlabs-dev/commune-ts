import JSONBigInt from "json-bigint";
import fetch from "node-fetch";

const result = await fetch("http://localhost:3000/api/stake-out");

const JSONBig = JSONBigInt({
  useNativeBigInt: true,
  alwaysParseAsBig: true,
  strict: true,
});

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const data = await JSONBig.parse(await result.text());

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
console.log(data.perAddr);

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
console.log("total: ", data.total);
