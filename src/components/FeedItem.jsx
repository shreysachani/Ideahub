import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setToken, removeToken } from '../stores/userSlice';
import { BsHandThumbsUp, BsHandThumbsDown } from 'react-icons/bs'; // Importing thumbs-up and thumbs-down icons

const FeedItem = ({ post, onDeletePost }) => {
  const [showExtraModal, setShowExtraModal] = useState(false);
  const [localPost, setLocalPost] = useState(post); // Local state for the post
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  const showToast = (message, type = "success") => {
    dispatch({
      type: "toast/showToast",
      payload: { ms: 3000, message, classes: `toast-${type}` }
    });
  };

  const likePost = async (id) => {
    try {
      const response = await axios.post(`/api/posts/${id}/like/`);
      if (response.data.message === "like created") {
        // If the user has already disliked, decrease dislike count
        if (localPost.dislikes_count > 0) {
          setLocalPost((prevPost) => ({
            ...prevPost,
            dislikes_count: prevPost.dislikes_count - 1, // Decrease dislike count
            likes_count: prevPost.likes_count + 1, // Increase like count
          }));
        } else {
          setLocalPost((prevPost) => ({
            ...prevPost,
            likes_count: prevPost.likes_count + 1, // Increase like count
          }));
        }
        showToast("You liked the post!", "success");
      }
    } catch (error) {
      showToast("Error liking post.", "error");
    }
  };

  const dislikePost = async (id) => {
    try {
      const response = await axios.post(`/api/posts/${id}/dislike/`);
      if (response.data.message === "Post Dislike") {
        // If the user has already liked, decrease like count
        if (localPost.likes_count > 0) {
          setLocalPost((prevPost) => ({
            ...prevPost,
            likes_count: prevPost.likes_count - 1, // Decrease like count
            dislikes_count: prevPost.dislikes_count + 1, // Increase dislike count
          }));
        } else {
          setLocalPost((prevPost) => ({
            ...prevPost,
            dislikes_count: prevPost.dislikes_count + 1, // Increase dislike count
          }));
        }
        showToast("You disliked the post!", "success");
      }
    } catch (error) {
      showToast("Error disliking post.", "error");
    }
  };

  const reportPost = async () => {
    try {
      const response = await axios.post(`/api/posts/${post.id}/report/`);
      showToast("The post was reported.", "success");
    } catch (error) {
      showToast("Error reporting post.", "error");
    }
  };

  const deletePost = async () => {
    try {
      await axios.delete(`/api/posts/${post.id}/delete/`);
      showToast("The post was deleted.", "success");
      onDeletePost(post.id); // Notify parent about deletion
    } catch (error) {
      showToast("Error deleting post.", "error");
    }
  };

  const toggleExtraModal = () => {
    setShowExtraModal(prev => !prev);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <img
            src={localPost.created_by.get_avatar}
            alt="avatar"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <Link
              to={`/profile/${localPost.created_by.id}`}
              className="font-semibold text-gray-800"
            >
              {localPost.created_by.name}
            </Link>
            <p className="text-sm text-gray-500">{localPost.created_at_formatted} ago</p>
          </div>
        </div>
      </div>

      {/* Attachments */}
      {localPost.attachments.length > 0 && (
        <div className="mb-4">
          {localPost.attachments.map((image) => (
            <img
              key={image.id}
              src={image.get_image}
              alt="attachment"
              className="rounded-lg mb-4"
            />
          ))}
        </div>
      )}

      {/* Body */}
      <p className="text-gray-700 mb-4">{localPost.body}</p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Actions */}
        <div className="flex items-center space-x-6">
          {/* Like */}
          <button
            onClick={() => likePost(localPost.id)}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-500"
          >
            <BsHandThumbsUp className="w-6 h-6" />
            <span>{localPost.likes_count} likes</span>
          </button>

          {/* Dislike */}
          <button
            onClick={() => dislikePost(localPost.id)}
            className="flex items-center space-x-2 text-gray-600 hover:text-red-500"
          >
            <BsHandThumbsDown className="w-6 h-6" />
            <span>{localPost.dislikes_count} dislikes</span>
          </button>

          {/* Comments */}
          <Link
            to={`/postview/${localPost.id}`}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 17.25c.167 1.315.87 2.57 1.79 3.356A8.506 8.506 0 0012 20.25z"
              />
            </svg>
            <span>{localPost.comments_count} comments</span>
          </Link>
        </div>

        {/* Extra actions */}
        {user?.id === post.created_by.id && (
          <button onClick={toggleExtraModal} className="text-gray-600 hover:text-blue-500">
            More
          </button>
        )}
      </div>

      {/* Extra modal */}
      {showExtraModal && (
        <div className="absolute top-0 right-0 bg-white shadow-lg rounded-lg p-4">
          <button onClick={deletePost} className="text-red-500">Delete</button>
          <button onClick={reportPost} className="text-blue-500">Report</button>
        </div>
      )}
    </div>
  );
};

export default FeedItem;
