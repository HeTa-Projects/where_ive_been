import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';

initializeApp();

const db = getFirestore();
const expoPushEndpoint = 'https://exp.host/--/api/v2/push/send';

type NotificationPayload = {
  title?: string;
  body?: string;
  postId?: string;
  type?: string;
};

async function getExpoTokens(userId: string) {
  const snapshot = await db.collection('users').doc(userId).collection('devices').get();
  return snapshot.docs
    .map((doc) => doc.data().token)
    .filter((token): token is string => typeof token === 'string' && token.startsWith('ExponentPushToken['));
}

async function sendExpoPush(userId: string, payload: NotificationPayload) {
  const tokens = await getExpoTokens(userId);
  if (!tokens.length) return;

  const messages = tokens.map((to) => ({
    to,
    sound: 'default',
    title: payload.title ?? 'Where I’ve Been',
    body: payload.body ?? 'Yeni bildirimin var.',
    data: {
      postId: payload.postId ?? null,
      type: payload.type ?? 'system',
    },
  }));

  const response = await fetch(expoPushEndpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messages),
  });

  if (!response.ok) {
    logger.warn('Expo push failed', { userId, status: response.status, text: await response.text() });
  }
}

export const sendUserNotificationPush = onDocumentCreated('users/{userId}/notifications/{notificationId}', async (event) => {
  const userId = event.params.userId;
  const notification = event.data?.data() as NotificationPayload | undefined;
  if (!notification) return;

  await sendExpoPush(userId, notification);
});

export const createCommentNotification = onDocumentCreated('communityPosts/{postId}/comments/{commentId}', async (event) => {
  const comment = event.data?.data();
  if (!comment) return;

  const postRef = db.collection('communityPosts').doc(event.params.postId);
  const postSnapshot = await postRef.get();
  const post = postSnapshot.data();
  const postAuthorId = post?.authorId;

  if (!postAuthorId || postAuthorId === comment.authorId) return;

  await db.collection('users').doc(postAuthorId).collection('notifications').add({
    type: 'comment',
    title: 'Yeni yorum',
    body: `${comment.authorName ?? 'Bir gezgin'} paylaşımına yorum yaptı.`,
    postId: event.params.postId,
    read: false,
    createdAt: new Date(),
  });
});
