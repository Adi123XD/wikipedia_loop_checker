import React, { useState } from 'react';
import { Container, Paper, TextField, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import axios from 'axios';
import * as cheerio from 'cheerio';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import { toast } from 'react-hot-toast';

const Home = () => {
    const Item = styled(Paper)(({ theme }) => ({
        backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
        ...theme.typography.body2,
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    }));

    const [url, setUrl] = useState('');
    const [count, setCount] = useState(0)
    const [path, setPath] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const extractFirstLink = (htmlContent) => {
        const selector = cheerio.load(htmlContent);
        // Select the first paragraph element within the specified class
        const firstPara = selector('#mw-content-text > div.mw-parser-output > p')
        const firstATag = firstPara.find('a').first();
        const hrefValue = firstATag ? firstATag.attr('href') : null;
        const baselink = url.split('/wiki/')[0];
        // setUrl(`${baselink}${hrefValue}`)
        return `${baselink}${hrefValue}`
    };
    const isValidLink = (link) => {
        try {
          new URL(link);
          return true;
        } catch (error) {
          return false;
        }
      };

    const fetchPageContent = async (url) => {
        try {
            const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
            const response = await axios.get(`${proxyUrl}${url}`);
            const htmldata = response.data
            return htmldata
        } catch (error) {
            console.error(error.message);
            setError("Error fetching Page Content")
            throw new Error('Error fetching page content.');
        }
    };

    const checkLoop = async () => {
        setLoading(true);
        let count = 0
        let pathArr = []
        try {
            let nextlink = url
            while (nextlink || url) {
                if (nextlink && nextlink.endsWith('/wiki/Philosophy')) {
                    pathArr.push(nextlink)
                    // console.log('Pause triggered on Philosophy link');
                    break;
                }
                else if (pathArr.includes(nextlink))
                {
                    setError("Loop Detected")
                    break;
                }
                else if (!isValidLink(nextlink))
                {
                    setError("Invalid Link")
                    break;
                }
                count++;
                pathArr.push(nextlink)
                let htmlData = await fetchPageContent(nextlink);
                nextlink = extractFirstLink(htmlData);
                // console.log("next url is", nextlink)
            }

            setPath(pathArr)
            setCount(count)
            // console.log(pathArr)
            // console.log(path)
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        setError(null);
        setCount(0);
        setPath([]);
        if(!isValidLink(url))
        {
            setError("Invalid Link")
        }
        else if (!url.startsWith('https://en.wikipedia.org/wiki/')) {
            setError("Please enter a valid Wikipedia url")
        }
        else {
            checkLoop();
        }
    };

    return (
        <>
            <Typography variant='h2' align='center' sx={{ marginBottom: '2rem' }}>
                Wikipedia Loop Checker
            </Typography>
            <Container component={'main'} maxWidth="md">
                <Paper elevation={3} sx={{ padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: "2rem", maxHeight: "80vh", overflowY: "scroll" }}>
                    <form onSubmit={handleFormSubmit} className='w-full'>
                        <TextField required fullWidth label="Wikipedia URL" margin='normal' variant='outlined' value={url} onChange={(e) => setUrl(e.target.value)} />
                        <Button sx={{ marginTop: '1rem', marginBottom: '1rem' }} variant="contained" color='primary' type='submit' fullWidth disabled={loading}>
                            {loading ? 'Checking...' : 'Enter'}
                        </Button>
                    </form>
                    {error && <p style={{ color: 'red', marginBottom: "1rem" }} className='w-full'>{error}</p>}
                    {!loading && count > 0 && <p style={{ marginBlock: "1rem" }} className='w-full'>There are {count} links before Philisophy page</p>}
                    {!loading &&
                        <Stack spacing={2} sx={{ width: "100%" }}>
                            {path.map((item, index) => (
                                <Item key={index} ><a href={`${item}`} target='_blank'>{item}</a></Item>
                            ))}
                        </Stack>
                    }
                </Paper>
            </Container>
        </>
    );
};

export default Home;
