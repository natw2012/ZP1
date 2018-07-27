exports.getType = function (typeID){
    switch(typeID){
        case 1: //Tiny Int
        case 2: //Small Int
        case 3: //Int
        case 4: //Float
        case 5: //Double
        case 8: //Big Int
        case 9: //Medium Int
        case "int": 
        case "float":
        case "double":
            return "number";
        case 7: //Time Stamp
            return "date";
        case 10: //Date
        case "date":
            return "date";
        case 11: //Time
        case "time":
            return "time";
        case 12: //Date Time - Doesn't work with time format of html
            return "date";
        case 13: //Year
        case "year":
            return "date";
        case 252: //Text
        case "varchar":
        case 253: //Varchar
        case 254: //Char
            return "text";
        default:
            return "text";
    }
}