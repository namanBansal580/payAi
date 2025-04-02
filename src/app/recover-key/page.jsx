"use client"
import React from 'react'
import { GoogleLogin,useGoogleOneTapLogin } from '@react-oauth/google';
import TwitterLogin from 'react-twitter-login';
import { TwitterOauthButton } from './TwitterOAuthButton';

const page = () => {
  const authHandler = (err, data) => {
    console.log("My Error is::",err);
    console.log("My Data is::",data);
    
    console.log(err, data);
  };
  return (
    <div className='mt-20'>
  <GoogleLogin 
  onSuccess={credentialResponse => {
    console.log(credentialResponse['credential']);
    
    document.cookie=`token="${credentialResponse['credential']}";path=/`
    router.push('/')
    router.refresh()
  }}
  onError={() => {
    console.log('Login Failed');
  }}
/>
{/* <TwitterLogin */}
<TwitterLogin
      authCallback={authHandler}
      consumerKey="BOFzTn7ntd1IStkyCCGXDKQRo"
      consumerSecret="eZo8875sMDVHaVrMvuW43UVSso6MSDzQNK3SRtlz0rAUTi2CVR"
      callbackUrl='http://localhost:3000/recover-key'
    />
    <TwitterOauthButton></TwitterOauthButton>
    </div>
  ) 
}

export default page