export const getSenderName = (loggedInUserId, user) => {
    if (loggedInUserId === user[0]._id) {
        return user[1].firstName + user[1].middleName + user[1].lastName;
    }
    else {
        return user[0].firstName + user[0].middleName + user[0].lastName;
    }
}

export const getSenderPicture = (loggedInUserId, user) => {
    if (!loggedInUserId || !user) return;
    if (loggedInUserId === user[0]._id) {
        return user[1].picturePath;
    }
    else {
        return user[0].picturePath;
    }
}

export const getSenderId = (loggedInUserId, user) => {
    if (!loggedInUserId || !user) return;
    if (loggedInUserId === user[0]._id) {
        return user[1]._id;
    } else {
        return user[0]._id;
    }
}

export const isLoggedInUser = (loggedInUserId, otherUserId) => {
    return loggedInUserId === otherUserId;
};