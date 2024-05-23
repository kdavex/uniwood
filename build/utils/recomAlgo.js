"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recommendPosts = void 0;
const client_1 = require("@prisma/client");
// Function to calculate similarity between two users based on interests and liked posts
function calculateUserSimilarity(user1, user2) {
    let similarityScore = 0;
    // Check for common interests
    similarityScore += user1.interests.filter((interest) => user2.interests.includes(interest)).length;
    // Check for overlap in liked posts
    similarityScore += user1.liked_posts_id.filter((postId) => user2.liked_posts_id.includes(postId)).length;
    return similarityScore;
}
// Function to recommend posts to a user based on similar users' likes
async function recommendPosts(user, allPosts) {
    const similarUsers = [];
    const prisma = new client_1.PrismaClient();
    try {
        const allUsers = await prisma.user.findMany({
            where: {
                id: user.id,
            },
            select: {
                id: true,
                interests: true,
                liked_posts_id: true,
            },
        });
        if (!allUsers.length) {
            // User not found, but handle gracefully (e.g., return empty array)
            return [];
        }
        // Find most similar users based on calculateUserSimilarity
        for (const otherUser of allUsers) {
            if (otherUser.id !== user.id) {
                // Avoid comparing user to themself
                const similarity = calculateUserSimilarity(user, otherUser);
                if (similarity > 0) {
                    similarUsers.push(otherUser);
                }
            }
        }
        // Sort similar users by similarity score (highest first)
        similarUsers.sort((a, b) => calculateUserSimilarity(user, b) - calculateUserSimilarity(user, a));
        // Recommend posts liked by the most similar users that the user hasn't already liked
        const recommendations = [];
        for (const similarUser of similarUsers) {
            for (const likedPostId of similarUser.liked_posts_id) {
                if (!user.liked_posts_id.includes(likedPostId)) {
                    const recommendedPost = allPosts.find((post) => post.id === likedPostId);
                    if (recommendedPost) {
                        recommendations.push(recommendedPost);
                    }
                }
            }
        }
        if (recommendations.length === 0) {
            console.log("No recommendations found using similarity. Using random fallback.");
            // Sample a random subset of posts (adjust the logic as needed)
            return rdmzr(allPosts);
        }
        return recommendations;
    }
    catch (error) {
        console.error("Error recommending posts:", error);
        // Handle Prisma or other errors gracefully (e.g., return empty array)
        return [];
    }
    finally {
        await prisma.$disconnect();
    }
}
exports.recommendPosts = recommendPosts;
function rdmzr(array) {
    let currentIndex = array.length;
    let randomIndex;
    // While there are elements to shuffle
    while (currentIndex !== 0) {
        // Pick a remaining element
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        // Swap the current element with the random element
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }
    return array;
}
