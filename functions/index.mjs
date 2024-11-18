import { initializeApp } from "firebase-admin/app";
import { onRequest } from "firebase-functions/v2/https";

import * as server from "./server/server.mjs";

initializeApp();

export const ssr = onRequest(server.app());
