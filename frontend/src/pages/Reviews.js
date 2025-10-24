import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles.css";

function Reviews({ collegeId: propCollegeId, showForm = false }) {
  const { collegeId: paramCollegeId } = useParams();
  const collegeId = propCollegeId || paramCollegeId;

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const [user, setUser] = useState(null);

  // ✅ Get logged-in user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // ✅ Fetch reviews (specific college or all)
 useEffect(() => {
  const fetchReviews = async () => {
    try {
      let url = "http://localhost:5000/api/reviews";
      if (collegeId) url += `?collegeId=${collegeId}`;

      const res = await axios.get(url);
      console.log("Fetched reviews:", res.data);
      setReviews(res.data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  fetchReviews();
}, [collegeId]);



  // ✅ Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !comment) return alert("All fields are required");
    if (!user) return alert("Please login to add a review.");
    if (!collegeId) return alert("Invalid college ID");

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/reviews",
        { collegeId, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviews([...reviews, res.data.review]);
      setRating("");
      setComment("");
      alert("Review submitted successfully!");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.message || "Error submitting review");
    }
  };

  return (
    <div className="reviews-section">
      <h2 className="review-heading-text">{collegeId ? "College Reviews" : "All Reviews"}</h2>

      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        reviews.map((rev) => (
          <div key={rev._id} className="review-card">
            <p>
              <strong>{rev.userId?.name || "Anonymous"}</strong>
            </p>
            {rev.collegeId && (
              <p className="college-name">
                <em>College: {rev.collegeId.name}</em>
              </p>
            )}
            <p>Rating: ⭐ {rev.rating}</p>
            <p>{rev.comment}</p>
          </div>
        ))
      )}

      {/* ✅ Show add-review form only inside Colleges page */}
      {showForm && user && (
        <form onSubmit={handleSubmit} className="review-form">
          <input
            type="number"
            placeholder="Rating (1-5)"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            min="1"
            max="5"
            required
          />
          <textarea
            placeholder="Write comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />
          <button type="submit">Submit Review</button>
        </form>
      )}

      {showForm && !user && <p>Please login to add a review.</p>}
    </div>
  );
}

export default Reviews;
