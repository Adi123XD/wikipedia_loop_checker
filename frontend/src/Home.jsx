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
    const backend_url = "http://localhost:3000"
    const [url, setUrl] = useState('');
    const [count, setCount] = useState(0)
    const [path, setPath] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const isValidLink = (link) => {
        try {
          new URL(link);
          return true;
        } catch (error) {
          return false;
        }
      };
    const handleFormSubmit = async(e) => {
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
            // checkLoop();
            setLoading(true)
            try {
                const response = await axios.get(`${backend_url}?url=${url}`);
                if (response.status === 500) {
                    throw new Error(`Internal server error ${response.data.message}`);
                }
                setPath(response.data.pathArr);
                setCount(response.data.count);
              } catch (error) {
                console.log(error.message)
                setError(error.response?.data?.message||"Internal Server Error");
              } finally {
                setLoading(false);
              }
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
                    {/* {!loading && count == 0 && <p style={{ marginBlock: "1rem" }} className='w-full'>This is the Philisophy page</p>} */}
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
