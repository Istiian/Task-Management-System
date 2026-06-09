import User from './user.js';
import Task from './task.js';
import Project from './project.js';
import Comment from './comment.js';
import TaskAssignees from './task_assignees.js';
import ProjectMembers from './project_member.js';

// All Sequelize associations are defined here in one place to avoid circular imports.

// User → Task (one-to-many via userId — legacy direct ownership, kept for relation completeness)
User.hasMany(Task, { foreignKey: 'userId', as: 'tasks' });
Task.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User → Comment (one-to-many)
User.hasMany(Comment, { foreignKey: 'authorId', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

// Task → Comment (one-to-many)
Task.hasMany(Comment, { foreignKey: 'taskId', as: 'comments' });
Comment.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });

// Project → Task (one-to-many)
Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks' });
Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// User ↔ Task (many-to-many through TaskAssignees)
User.belongsToMany(Task, { through: TaskAssignees, as: 'assignedTasks', foreignKey: 'userId' });
Task.belongsToMany(User, { through: TaskAssignees, as: 'assignees', foreignKey: 'taskId' });

// Explicit TaskAssignees associations — needed for direct includes on the join table
TaskAssignees.belongsTo(User, { as: 'user', foreignKey: 'userId' });
TaskAssignees.belongsTo(Task, { as: 'task', foreignKey: 'taskId' });
User.hasMany(TaskAssignees, { as: 'taskAssignments', foreignKey: 'userId' });
Task.hasMany(TaskAssignees, { as: 'taskAssignments', foreignKey: 'taskId' });

// User ↔ Project (many-to-many through ProjectMembers)
User.belongsToMany(Project, { through: ProjectMembers, as: 'projects', foreignKey: 'userId' });
Project.belongsToMany(User, { through: ProjectMembers, as: 'members', foreignKey: 'projectId' });

// Explicit ProjectMembers associations — needed for direct includes on the join table
ProjectMembers.belongsTo(User, { as: 'user', foreignKey: 'userId' });
ProjectMembers.belongsTo(Project, { as: 'project', foreignKey: 'projectId' });
User.hasMany(ProjectMembers, { as: 'projectMemberships', foreignKey: 'userId' });
Project.hasMany(ProjectMembers, { as: 'projectMemberships', foreignKey: 'projectId' });

// Project → User (ownership — one project has one owner)
Project.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });
User.hasMany(Project, { as: 'ownedProjects', foreignKey: 'ownerId' });

export { User, Task, Project, Comment, TaskAssignees, ProjectMembers };
