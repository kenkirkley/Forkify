import axios from "axios";
import { key } from "../config";
export default class Search {
  constructor(query) {
    this.query = query;
  }
  async getResults() {
    // if you need a proxy for cors
    // const proxy = "https://crossorigin.me/";
    try {
      // straight to json
      const jsonresult = await axios(
        `https://www.food2fork.com/api/search?key=${key}&q=${this.query}`
      );

      this.results = jsonresult.data.recipes;
      //   console.log(this.results);
    } catch (error) {
      console.log(key);
      alert(error);
    }
  }
}
