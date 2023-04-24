import jwt_decode from 'jwt-decode';
import { JwtDTO } from '../auth/dto/jwt.dto';
var moment = require('moment-timezone');


export function isEmptyOrNullField(field) {
  return field === '' || field === null || field == undefined;
}

export function isEmptyField(field: string): boolean {
  return field === '';
}

export function isNullField(field: any): boolean {
  return field === null || field == undefined;
}

export function isNotValidEmail(email: string): boolean {
  //const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const regex = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/;
  return !regex.test(email);
}

export function isNotValidPassword(password: string): boolean {
  const regex = /^(.{0,7}|[^0-9]*|[^A-Z]*|[^a-z]*)$/;
  return regex.test(password);
}

export function isNotValidFieldString(string: string): boolean {
  const regex = /^[a-zA-Z\.,;À-ÿ\u00f1\u00d1]*$/;
  return !regex.test(string);
}

export function isNotValidFieldStringWithSpaces(string: string): boolean {
  const regex = /^[a-zA-Z\s\.,;À-ÿ\u00f1\u00d1]*$/;
  return !regex.test(string);
}

export function isNotValidFieldNumber(number: string): boolean {
  const regex = /^[0-9]*$/;
  return !regex.test(number);
}

export function isNotValidArrayNumber(numbers: number[]) {
  numbers.forEach((element) => {
    if (isNotValidFieldNumber(element.toString())) return true;
  });
  return false;
}

export function isNotValidFieldBoolean(bool: boolean) {
  return !(bool === true || bool === false);
}

export function isNotValidGender(gender: string): boolean {
  const regex = /^[MFON]$/;
  return !regex.test(gender);
}

export function isNotValidDate(date: string): boolean{
    const regex = /^\d{4}([\-/.])(0?[1-9]|1[0-1-2])\1(3[01]|[12][0-9]|0?[1-9])$/;
    return !regex.test(date);
}

export function isNotValidDateTime(dateTime: string): boolean{
    const regex = /^\d{4}([\-/.])(0?[1-9]|1[0-1-2])\1(3[01]|[12][0-9]|0?[1-9])(T)([0-1][0-9]|2[0-3])(:)([0-5][0-9])$/;
    return !regex.test(dateTime);
}

export function isDateGreatherDateNow(date: string) {
    // const fechaActual: Date = new Date();
    // const fecha: Date = new Date(date);
    const fechaActual = moment().tz("America/Buenos_Aires").format();
    const fecha = moment(date).tz("America/Buenos_Aires").format();
    return (fecha > fechaActual);
}


export function isNotValidDate1GreatherDate2(date1: string, date2: string) {
  const fechaFin: Date = new Date(date1);
  const fechaInicio: Date = new Date(date2);
  return !(fechaFin >= fechaInicio);
}

export function isNotValidFieldStringAndNumber(string: string): boolean {
  const regex = /^[a-zA-Z0-9\.,;À-ÿ\u00f1\u00d1]*$/;
  return !regex.test(string);
}

export function isNotValidFieldStringAndNumberWithSpaces(
  string: string,
): boolean {
  const regex = /^[a-zA-Z0-9\s\.,;À-ÿ\u00f1\u00d1]*$/;
  return !regex.test(string);
}

export async function getNextSequence(name: string, db): Promise<number> {
  const collection = db.collection('Counters');

    try {
        const result = await collection.findOneAndUpdate(
            { counters_id: name },
            { $inc: { seq: 1 } },
            { returnOriginal: false, returnDocument: "after" }
        );
        return result.value.seq;
    }
    catch(error){
        throw new Error(error);
    };
 }

export function decodeJWT(token: string): JwtDTO {
  return jwt_decode(token);
}

export function parseDateToString(date: Date): string {
  let parsedDate: string, currentYear, currentMonth, currentDay;
  currentYear = date.getFullYear().toString();
  currentMonth = ('0' + (date.getMonth() + 1)).slice(-2);
  currentDay = ('0' + date.getDate()).slice(-2);
  parsedDate = currentYear + '-' + currentMonth + '-' + currentDay;

  return parsedDate;
}

export function isNotValidTime(time: string): boolean {
  const pattern = /([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]/g;
  return !pattern.test(time);
}

export function isNotValidTimeWithoutSeconds(time: string): boolean {
  const patter = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  return !patter.test(time);
}

export function isEmptyObject(object): boolean {
    return Object.entries(object)?.length === 0;
}

export function isDateNow(now: Date, date: string): boolean {
  const nowParseToString = parseDateToString(now);
  return nowParseToString === date;
}

export function convertBytesToMegaBytes(bytes: number){
  return (bytes / 1000000)
}