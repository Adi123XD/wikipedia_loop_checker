import axios from 'axios'
import * as cheerio from 'cheerio'
import 'dotenv/config'
export const isValidLink = (link) => {
    try {
        new URL(link);
        return true;
    } catch (error) {
        return false;
    }
};
export const fetchPageContent = async (url) => {
    try {
        const response = await axios.get(`${url}`);
        const htmldata = response.data
        return htmldata
    } catch (error) {
        console.error("error here", error.message);
        throw new Error('Error fetching page content.');
    }
};
export const extractFirstLink = (htmlContent) => {
    try {
        const selector = cheerio.load(htmlContent);
        const firstPara = selector('#mw-content-text > div.mw-parser-output > p')
        firstPara.find('sup').remove();
        const firstATag = firstPara.find('a').first();
        const hrefValue = firstATag ? firstATag.attr('href') : null;
        const baselink = process.env.BASELINK
        if (hrefValue !== null) {
            return `${baselink}${hrefValue}`;
        } else {
            throw new Error("No href attribute found for the first <a> tag.");
        }
    } catch (error) {
        console.log(error.message)
        throw new Error ("Error in extracting the first link ")
    }

};
export const checkLoop = async (url) => {
    let count = 0
    let pathArr = []
    try {
        let nextlink = url
        while (nextlink) {
            // console.log(nextlink)
            if (nextlink && nextlink.endsWith('/wiki/Philosophy')) {
                pathArr.push(nextlink)
                break;
            }
            else if (pathArr.includes(nextlink)) {
                break;
            }
            else if (!isValidLink(nextlink)) {
                break;
            }
            count++;
            pathArr.push(nextlink)
            let htmlData = await fetchPageContent(nextlink);
            nextlink = extractFirstLink(htmlData);
        }
        return { pathArr, count }
    } catch (error) {
        console.log(error.message)
        throw new Error (error.message)
    }
};