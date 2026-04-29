#!/usr/bin/env node

/**
 * actions/story-api.cjs — 禅道 Story API 路由处理
 * 
 * 功能：
 *   - 自动根据 project 参数构建正确的 API 路径
 *   - 支持 /stories 和 /projects/{id}/stories 两种路径
 */

const { get, post, put, del } = require('./api.cjs');

/**
 * 构建Story API路径
 */
function buildStoryEndpoint(projectId, base = '/stories') {
  if (projectId) {
    return `/projects/${projectId}${base}`;
  }
  return base;
}

/**
 * Story列表查询（自动处理project参数）
 */
async function queryStories(params, query = {}) {
  const projectId = params.project;
  const endpoint = buildStoryEndpoint(projectId, '/stories');
  
  const page = params.page || 1;
  const limit = params.limit || 20;

  const reqQuery = {
    recPerPage: limit,
    pageID: page,
  };
  
  if (params.product) reqQuery.product = params.product;
  if (params.status) reqQuery.status = params.status;
  if (params.assignedTo) reqQuery.assignedTo = params.assignedTo;
  if (params.priority) reqQuery.priority = params.priority;
  if (params.orderBy) reqQuery.orderBy = params.orderBy;

  return await get(endpoint, { ...reqQuery, ...query });
}

/**
 * Story详情查询
 */
async function getStory(storyId, projectId = null) {
  const endpoint = projectId 
    ? `/projects/${projectId}/stories/${storyId}`
    : `/stories/${storyId}`;
  
  return await get(endpoint);
}

/**
 * 创建Story
 */
async function createStory(body, projectId = null) {
  const endpoint = projectId 
    ? `/projects/${projectId}/stories`
    : '/stories';
  
  return await post(endpoint, body);
}

/**
 * 更新Story
 */
async function updateStory(storyId, body, projectId = null) {
  const endpoint = projectId 
    ? `/projects/${projectId}/stories/${storyId}`
    : `/stories/${storyId}`;
  
  return await put(endpoint, body);
}

/**
 * 关闭Story
 */
async function closeStory(storyId, body, projectId = null) {
  const endpoint = projectId 
    ? `/projects/${projectId}/stories/${storyId}/close`
    : `/stories/${storyId}/close`;
  
  return await put(endpoint, body);
}

/**
 * 评审Story
 */
async function reviewStory(storyId, body, projectId = null) {
  const endpoint = projectId 
    ? `/projects/${projectId}/stories/${storyId}/review`
    : `/stories/${storyId}/review`;
  
  return await put(endpoint, body);
}

module.exports = {
  queryStories,
  getStory,
  createStory,
  updateStory,
  closeStory,
  reviewStory,
  buildStoryEndpoint
};
