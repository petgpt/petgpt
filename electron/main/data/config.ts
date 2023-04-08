import dbMap from "./db";
import {DBList} from "../types/enum";
import {
    Detail_Window_Height,
    Detail_Window_Width,
    Main_Window_Height,
    Main_Window_Width
} from "../../../src/utils/events/constants";

function dbSetIfNotPresent(db:DBList, key: string, value) {
    if(dbMap.has(db) && !dbMap.get(db).has(key)) dbMap.get(db).set(key, value)
}

export default {
    setConfig() {
        dbSetIfNotPresent(DBList.Config_DB, Main_Window_Width, 260)
        dbSetIfNotPresent(DBList.Config_DB, Main_Window_Height, 220)
        dbSetIfNotPresent(DBList.Config_DB, Detail_Window_Width, 1200)
        dbSetIfNotPresent(DBList.Config_DB, Detail_Window_Height, 600)
    },
}