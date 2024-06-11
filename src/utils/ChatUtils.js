export const getSenderName = (loggedInUserId, user) => {
    if (loggedInUserId === user[0]._id) {
        return user[1].firstName + user[1].middleName + user[1].lastName;
    }
    else {
        return user[0].firstName + user[0].middleName + user[0].lastName;
    }
}

export const getSenderPicture = (loggedInUserId, user) => {
    if (loggedInUserId === user[0]._id) {
        return user[1].picturePath;
    }
    else {
        return user[0].picturePath;
    }
}

export const isLoggedInUser = (loggedInUserId, otherUserId) => {
    return loggedInUserId === otherUserId;
}

export const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
    } else {
        const options = { month: "short", day: "numeric", year: "numeric" };
        return date.toLocaleDateString(undefined, options);
    }
};

export const renderTime = (time) => {
    const date = new Date(time);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};
