export class Helpers {
  static capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  static generateRandomIntegers(integerLength: number): number {
    const characters = '0123456789';
    const charactersLength = characters.length;

    let result = '';
    for (let i = 0; i < integerLength; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return parseInt(result, 10);
  }

  static lowerCase(str: string): string {
    return str.toLowerCase();
  }

  static parseJson(prop: string): any {
    try {
      JSON.parse(prop);
    } catch (error) {
      return prop;
    }
    return JSON.parse(prop);
  }
}
