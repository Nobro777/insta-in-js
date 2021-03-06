import React, { useState, useEffect } from 'react';
import Post from './Post';
import './App.css';
import { db, auth } from './firebase';
import { makeStyles } from '@material-ui/core/styles';
import { Input, Button } from '@material-ui/core';
import Modal from '@material-ui/core/Modal';
import Uploader from './Uploader';
import { Collapse, CardBody, Card } from 'reactstrap';

function rand() {
  return Math.round(Math.random() * 20) - 10;
}

function getModalStyle() {
  const top = 50 + rand();
  const left = 50 + rand();

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

function App(props) {

  const classes = useStyles();
  const [modalStyle] = useState(getModalStyle);

  const [posts, setPosts] = useState([]);
  const [open, setOpen] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const [user, setUser] = useState(null);
  const [openSignIn, setOpenSignIn] = useState(false);
  const [photoURL, setPhotoURL] = useState('');
  
  const [openUpload, setOpenUpload] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        console.log("user is authed", authUser)
        setUser(authUser);
      } else {
        setUser(null)
      }
    }) 
    return () => {
      unsubscribe();
    }}, [])

    // const toggle = () => setOpenUpload(!openUpload);
    
    useEffect(() => {
      db.collection('posts').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
        setPosts(snapshot.docs.map(doc => ({
          id: doc.id,
          post: doc.data(),
        })))
      })
    },[])
    
    const signUp = (e) => {
      e.preventDefault();
  
      auth.createUserWithEmailAndPassword(email, password)
      .then((authUser) => {
        return authUser.user.updateProfile({
          displayName: username,
          photoURL: photoURL
        })
      })
      .catch(error => alert(error.message))

      setOpen(false)
    }

    const signIn = (e) => {
      e.preventDefault();

      auth.signInWithEmailAndPassword(email, password)
      .catch(err => alert("Your email and or password is incorrect, try again."))

      setOpenSignIn(false);
    }

    const toggle = () => setIsOpen(!isOpen);
    
    return (
      <div className="app">

      {/* {user?.displayName ? (
        <Uploader username={user.displayName} photoURL={user.photoURL}/>
      ):(
        console.log("not logged in")
      )}
       */}
      
      <Modal
        open={open}
        onClose={() => setOpen(false)}
      >
        <div style={modalStyle} className={classes.paper}>
          <form className="app__form">
            

            <center>
              <img src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png" alt="insta-logo" style={{margin:"15px 0 15px 0"}}/>
            </center>
          
              <Input 
              placeholder="Username..."
              type="text"
              value={username}
              onChange={(item) => setUsername(item.target.value)}
              />

              <Input 
              placeholder="Email..."
              type="text"
              value={email}
              onChange={(item) => setEmail(item.target.value)}
              />      

              <Input 
              placeholder="Password..."
              type="text"
              value={password}
              onChange={(item) => setPassword(item.target.value)}
              />

              <Input
              placeholder="Profile picture..."
              type="text"
              value={photoURL}
              onChange={(item) => setPhotoURL(item.target.value)}
              />

              <button onClick={signUp}> Done </button> 
          </form>
        </div>
      </Modal>
      <Modal
        open={openSignIn}
        onClose={() => setOpenSignIn(false)}
      >
        <div style={modalStyle} className={classes.paper}>
          <form className="app__form">
            <center>
              <img src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png" alt="insta-logo" style={{margin:"15px 0 15px 0"}}/>
            </center>

              <Input 
              placeholder="Email"
              type="text"
              value={email}
              onChange={(item) => setEmail(item.target.value)}
              />      

              <Input 
              placeholder="Password"
              type="text"
              value={password}
              onChange={(item) => setPassword(item.target.value)}
              />

              <button onClick={signIn}> Done </button> 
          </form>
        </div>
      </Modal>


      <div className="app__header" style={{display:"flex", justifyContent:"space-between", alignContent:"center", alignItems:"center", justifyItems:"center"}}>
        <img className="app__headerImage" src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png" alt="insta-logo" style={{maxHeight:"35px"}}/>
            { user ? (
                <div style={{display:"flex", justifyContent:"center", alignContent:"center", alignItems:"center", justifyItems:"center"}}>
                  {user?.displayName ? (
                    <div style={{display:"flex", flexDirection:"column", justifyContent:"center", alignContent:"center", alignItems:"center", justifyItems:"center"}}>
                      <center>
                        <div>
                          <Button color="primary" onClick={toggle} style={{color:"black"}}>Upload</Button>

                          <Modal
                            open={isOpen}
                            onClose={() => setIsOpen(false)}
                          >
                            <div style={modalStyle} className={classes.paper}>
                                      <Uploader username={user.displayName} photoURL={user.photoURL}/>
                            </div>
                          </Modal>
                        </div>
                      </center>
                    </div>
                ) : ( 
                  console.log("Not logged in")
                )
              }
              <Button onClick={() => auth.signOut()} style={{}}>Logout</Button>
          </div>
        ) : (

          <div>
            <Button onClick={() => setOpen(true)}>Sign Up</Button>
            <Button onClick={() => setOpenSignIn(true)}>Login</Button>
          </div>
        )
        }
      </div>


      <div className="app__posts" style={{padding:"20px"}}>
        {
          posts.map(({id, post}) => (
            <Post key={id} postId={id} user={user} username={post.username} caption={post.caption} imageURL={post.imageURL} photoURL={post.photoURL} />
            ))
        }
      </div>  



        



    </div>
  );
}

export default App;
