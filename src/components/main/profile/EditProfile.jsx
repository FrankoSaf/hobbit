import React, { useContext, useState, useEffect, useRef } from 'react';
import { UserContext } from '../../../context/user.context';
import { db, storage } from '../../../utils/firebase/firebase.utils';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import Context from '../../../context/contextProvider';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 } from 'uuid';

const EditProfile = () => {
  const { currentUser } = useContext(UserContext);
  const { onEditHandler } = useContext(Context);

  const [userData, setUserData] = useState(null);
  const [userInfo, setUserInfo] = useState({ userData });
  const [inputValue, setInputValue] = useState({});
  const [showAge, setShowAge] = useState(false);
  const [imageUpload, setImageUpload] = useState(false);
  const [image, setImage] = useState(null);
  const [url, setUrl] = useState(null);

  const hobby1 = useRef();
  const hobby2 = useRef();
  const hobby3 = useRef();
  const hobby4 = useRef();
  const hobby5 = useRef();
  const location = useRef();
  const message = useRef();
  const age = useRef();

  useEffect(() => {
    if (currentUser) {
      const docRef = doc(db, 'users', currentUser.uid);
      const gettingUser = async () => {
        const data = await getDoc(docRef);
        setUserData(data.data());
      };
      gettingUser();
    }
  }, [currentUser, showAge, url]);

  const onChangeEditHandler = (e) => {
    if (e.target.name.includes('hobby')) {
      setInputValue((pre) => ({
        ...pre,
        hobbies: { ...pre.hobbies, [e.target.name]: e.target.value },
      }));
    } else {
      setInputValue((pre) => ({ ...pre, [e.target.name]: e.target.value }));
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      let newImg = e.target.files[0];
      const imageRef = ref(storage, 'image' + v4());
      uploadBytes(imageRef, newImg)
        .then(() => {
          getDownloadURL(imageRef)
            .then((urlImg) => {
              console.log(urlImg, 'urlImg');
              setUrl(urlImg);
            })
            .catch((error) => console.log(error.message, 'error'));
          setImage(null);
        })
        .catch((error) => console.log(error.message, 'error'));
    }
  };

  const onEditSubmitHandler = (e) => {
    e.preventDefault();

    // setUserInfo((pre) => ({ ...pre, userData: inputValue }));
    setShowAge(true);
    let userAge = 0;
    if (userData.userData?.age) {
      userAge = userData.userData.age;
    } else {
      const today = new Date();
      const userBirthDate = new Date(age.current.value);
      userAge = userData.userData?.age
        ? userData.userData?.age
        : +today.getFullYear() - +userBirthDate.getFullYear();
      const m = today.getMonth() - userBirthDate.getMonth();

      // eslint-disable-next-line no-unused-expressions
      m < 0 || (m === 0 && today.getDate() < userBirthDate.getDate())
        ? userAge--
        : userAge;
    }

    const newArr = [
      hobby1.current.value, hobby2.current.value, hobby3.current.value, hobby4.current.value, hobby5.current.value, 
    ];

    const hobbyArray = newArr.filter((item) => item.trim().length > 0);
    const updatedUser = userInfo;

    updatedUser.userData = {
      age: userAge,
      image: url?.length > 0 ? url : userData?.userData?.image,
      message:
        message.current.value.split(' ').join('').length > 30
          ? message.current.value
          : "User doesn't have bio",
      location: location.current.value,
      hobbies: [...hobbyArray],
    };

    const updateUser = async () => {
      const userDoc = doc(db, 'users', currentUser.uid);
      await updateDoc(userDoc, updatedUser);
    };
    
    updateUser();
    onEditHandler();
  };

  // Imageee upload

  const maxDate = new Date(
    new Date().setFullYear(new Date().getFullYear() - 18)
  );
  let maxDay = maxDate.getDate();

  let maxMonth = maxDate.getMonth();

  let maxYear = maxDate.getFullYear();
  const minDate = new Date(
    new Date().setFullYear(new Date().getFullYear() - 100)
  );
  let minDay = minDate.getDate();
  let minMonth = minDate.getMonth();
  let minYear = minDate.getFullYear();
  if (+maxDay < 10) {
    maxDay = '0' + maxDay;
    minDay = '0' + minDay;
  }
  if (+maxMonth < 10) {
    maxMonth = '0' + maxMonth;
    minMonth = '0' + minMonth;
  }
  console.log(userData?.userData);
  return userData ? (
    <div className='edit-profile'>
      <form onSubmit={onEditSubmitHandler}>
        <div className='edit-profile'>
          <div className='edit-profile-top'>
            <div className='edit-profile-top__image'>
              {' '}
              <img
                src={
                  userData?.userData?.image
                    ? userData?.userData?.image
                    : 'https://firebasestorage.googleapis.com/v0/b/hobbyt-6b5c6.appspot.com/o/image?alt=media&token=c23f0054-d453-4bf5-8a90-1209b823fd8f'
                }
                alt=''
              />
              <input
                type='file'
                name='image'
                id='image'
                onChange={handleImageChange}
                accept='image/png, image/gif, image/jpeg'
              />
            </div>
            <div className='edit-profile-top__infos'>
              <h3>
                {userData.displayName
                  ? userData.displayName[0].toUpperCase() +
                    userData.displayName
                      .slice(1, userData.displayName.length)
                      .toLowerCase()
                  : 'Franko'}
                ,
                {userData.userData?.age ? (
                  userData.userData?.age
                ) : (
                  <input
                    type='date'
                    name='date'
                    id='date'
                    ref={age}
                    min={`${minYear}-${minMonth}-${minDay}`}
                    max={`${maxYear}-${maxMonth}-${maxDay}`}
                  />
                )}
              </h3>
              <input
                type='text'
                name='location'
                id='location'
                defaultValue={
                  userData?.userData ? userData?.userData?.location : ''
                }
                placeholder='Enter your location'
                onChange={onChangeEditHandler}
                ref={location && location}
                required
              />
            </div>
          </div>
          <div className='edit-profile__hobbies'>
            <ul>
              {Array.from(Array(5).keys()).map((item, id) => {
                return (
                  <li key={id}>
                    <span>Hobby{item + 1}</span>
                    <input
                      type='text'
                      name={`hobby${item + 1}`}
                      id={`hobby${item + 1}`}
                      placeholder={item === 0 ? 'Required' : 'Optional'}
                      defaultValue={
                        userData?.userData ? userData?.userData?.hobbies[item] : ''
                      }
                      ref={
                        item === 0
                          ? hobby1
                          : item === 1
                          ? hobby2
                          : item === 2
                          ? hobby3
                          : item === 3
                          ? hobby4
                          : item === 4 && hobby5
                      }
                    />
                  </li>
                );
              })}
            </ul>
          </div>
          <div className='edit-profile__about'>
            <div className='edit-profile__about-text'>
              <h3>About Me:</h3>
              <textarea
                onChange={onChangeEditHandler}
                name='message'
                ref={message}
                placeholder='You get more chance finding hobby partner if you have some bio (optional)'
              >
                {userData?.userData?.message ? userData?.userData?.message : ''}
              </textarea>
            </div>
          </div>
        </div>
        <button type='submit'>Apply Changes</button>
      </form>
    </div>
  ) : null;
};

export default EditProfile;
