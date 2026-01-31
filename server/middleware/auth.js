import { clerkClient } from "@clerk/express";

export const protectAdmin = async (req, res, next) => {
  try {
    // Get auth from request - Clerk middleware should have set this
    let auth;
    try {
      auth = req.auth();
    } catch (err) {
      // If req.auth() throws, user is not authenticated
      console.error("Auth error:", err.message);
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Please provide a valid authentication token",
      });
    }

    if (!auth || !auth.userId) {
      console.log("No auth or userId found in request");
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Authentication required",
      });
    }

    console.log("Authenticated user ID:", auth.userId);
    
    const user = await clerkClient.users.getUser(auth.userId);
    console.log("User role:", user.privateMetadata?.role);

    // ✅ Correct admin check
    if (user.privateMetadata?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    next();
  } catch (err) {
    console.error("protectAdmin error:", err);
    return res.status(401).json({
      success: false,
      message: "Not Authorized",
      error: err.message,
    });
  }
};
