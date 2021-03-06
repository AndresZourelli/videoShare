import {
	GET_ROOMS,
	REGISTER_USER,
	LOGIN_USER,
	LOGOUT_USER,
	GET_ERRORS,
	GET_EMAIL_TOKEN,
	AUTH_ERROR,
	DELETE_ROOM,
	CLEAR_DATA,
	GET_VIDEOS,
	DELETE_VIDEO,
	ADD_VIDEOS,
	ADD_RECENTLY_PLAYED,
	DELETE_RECENTLY_PLAYED,
	UPDATE_RECENTLY_PLAYED,
	RESET_FORM,
	LOGIN_ERROR
} from './types';
import axios from 'axios';

export const login_error_reset = () => (dispatch) => {
	dispatch({
		type: LOGIN_ERROR,
		payload: false
	});
};
export const resetForm = () => (dispatch) => {
	dispatch({
		type: RESET_FORM
	});
};
export const updateRecentlyPlayed = (videos) => (dispatch) => {
	dispatch({
		type: UPDATE_RECENTLY_PLAYED,
		payload: videos
	});
};
export const deleteRecentlyPlayed = (videos) => (dispatch) => {
	dispatch({
		type: DELETE_RECENTLY_PLAYED,
		payload: videos
	});
};
export const addToRecentlyPlayed = (video) => (dispatch) => {
	dispatch({
		type: ADD_RECENTLY_PLAYED,
		payload: video
	});
};
export const addVideos = (videos, room, socket) => (dispatch) => {
	videos.map((video, idx) => {
		const info = {
			url: video.url,
			room: room,
			videoID: video.videoID || null,
			position: idx
		};
		axios('/videoQueue/add', {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			data: JSON.stringify(info)
		})
			.then((data) => {
				dispatch({
					type: GET_VIDEOS,
					payload: data.data
				});

				socket.emit('newVideo', {
					queue: data.data.slice(1),
					main: data.data
				});
			})
			.catch((err) => {
				console.log(err);
				const errors = {
					msg: err.response.data,
					status: err.response.status
				};
				dispatch({
					type: GET_ERRORS,
					payload: errors
				});
				dispatch({
					type: ADD_VIDEOS,
					payload: 'errors'
				});
			});
		return dispatch({
			type: ADD_VIDEOS,
			payload: 'Success'
		});
	});
};

export const getVideos = (roomID) => (dispatch) => {
	axios('/videoQueue/getData', {
		method: 'POST',
		headers: {
			'content-type': 'application/json'
		},
		data: JSON.stringify({ room: roomID })
	}).then((data) => {
		dispatch({
			type: GET_VIDEOS,
			payload: data.data
		});
	});
};

export const deleteVideos = (videoID, roomID, socket) => (dispatch) => {
	let payload = {
		videoID: videoID,
		room: roomID
	};

	axios('/videoQueue/delete', {
		method: 'POST',
		headers: {
			'content-type': 'application/json'
		},
		data: JSON.stringify(payload)
	})
		.then((data) => {
			dispatch({
				type: GET_VIDEOS,
				payload: data.data
			});
			socket.emit('VideoSuccessFullyDeleted', 'delete');
		})
		.catch((err) => {
			const errors = {
				msg: err.response.data,
				status: err.response.status
			};
			dispatch({
				type: GET_ERRORS,
				payload: errors
			});
			dispatch({
				type: DELETE_VIDEO,
				payload: 'errors'
			});
		});
	return dispatch({
		type: DELETE_ROOM,
		payload: 'Success'
	});
};

export const registerUser = (newUserData) => (dispatch) => {
	axios('/registerUser', {
		method: 'POST',
		headers: {
			'content-type': 'application/json'
		},
		data: JSON.stringify(newUserData)
	})
		.then((payload) => {
			if (payload.data.token) {
				localStorage.setItem('token', payload.data.token);
			}
			dispatch({
				type: REGISTER_USER,
				payload: newUserData
			});
		})
		.catch((err) => {
			const errors = {
				msg: err.response.data.errors,
				status: err.response.status
			};
			dispatch({
				type: GET_ERRORS,
				payload: errors
			});
		});
};

export const loginUser = (loginData) => (dispatch) => {
	axios('/auth/login', {
		method: 'POST',
		headers: {
			'content-type': 'application/json'
		},
		data: JSON.stringify(loginData)
	})
		.then((data) => {
			if (data.data.token) {
				localStorage.setItem('token', data.data.token);
			}
			dispatch({
				type: LOGIN_USER,
				payload: data.message
			});
			dispatch({
				type: GET_ROOMS,
				payload: data.data.data
			});
		})
		.catch((err) => {
			const errors = {
				msg: 'Email or Password is incorrect',
				status: 401
			};
			dispatch({
				type: LOGIN_ERROR,
				payload: errors
			});
		});
};

export const logoutUser = () => (dispatch) => {
	dispatch({
		type: LOGOUT_USER
	});
	dispatch({
		type: CLEAR_DATA
	});
};

export const getRooms = (roomData) => (dispatch, getState) => {
	const token = getState().Auth.token;
	const headers = {
		'Content-Type': 'application/json'
	};

	if (token) {
		headers['Authorization'] = `bearer ${token}`;
	}

	axios('/auth/createRoom', {
		method: 'POST',
		headers,
		data: JSON.stringify({ name: roomData })
	})
		.then((res) => {
			dispatch({
				type: GET_ROOMS,
				payload: res.data.data
			});
		})
		.catch((err) => {
			const errors = {
				msg: err.response.data,
				status: err.response.status
			};
			dispatch({
				type: GET_ERRORS,
				payload: errors
			});
		});
};

export const getEmailToken = (token) => (dispatch) => {
	axios.get(`/auth/confirmation/${token}`).then((data, err) => {
		if (err) {
			dispatch({
				type: AUTH_ERROR,
				payload: err
			});
		} else {
			dispatch({
				type: GET_EMAIL_TOKEN,
				payload: true
			});
		}
	});
};

export const roomDelete = (id) => (dispatch, getState) => {
	const token = getState().Auth.token;
	const headers = {
		'Content-Type': 'application/json'
	};

	if (token) {
		headers['Authorization'] = `bearer ${token}`;
	}
	axios('/auth/DeleteRoom', {
		method: 'POST',
		headers,
		data: JSON.stringify({ roomID: id })
	})
		.then((res) => {
			dispatch({
				type: DELETE_ROOM,
				payload: res.data.data
			});
		})
		.catch((err) => {
			const errors = {
				msg: err.response.data,
				status: err.response.status
			};
			dispatch({
				type: GET_ERRORS,
				payload: errors
			});
		});
};
