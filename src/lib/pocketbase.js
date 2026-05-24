import Pocketbase from "pocketbase";
const pb = new Pocketbase(import.meta.env.VITE_POCKETBASE_URL || "http://127.0.0.1:8090");
export default pb;
