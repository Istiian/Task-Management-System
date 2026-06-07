import User from './user.js';
import Task from './task.js';
import Project from './project.js';
import Comment from './comment.js'
import TaskAssignees from './task_assignees.js';
import ProjectMembers from './project_member.js';

// User-Task (One-to-Many)
User.hasMany(Task, { foreignKey: 'userId', as: 'tasks' });
Task.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User-Comment (One-to-Many)
User.hasMany(Comment, { foreignKey: 'authorId', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

// Task-Comment (One-to-Many)
Task.hasMany(Comment, { foreignKey: 'taskId', as: 'comments' });
Comment.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });

// Project-Task (One-to-Many)
Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks' });
Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// User-Task (Many-to-Many through TaskAssignees)
User.belongsToMany(Task, { through: TaskAssignees, as: 'assignedTasks', foreignKey: 'userId' });
Task.belongsToMany(User, { through: TaskAssignees, as: 'assignees', foreignKey: 'taskId' });

// Explicit join table associations for TaskAssignees
TaskAssignees.belongsTo(User, { as: 'user', foreignKey: 'userId' });
TaskAssignees.belongsTo(Task, { as: 'task', foreignKey: 'taskId' });
User.hasMany(TaskAssignees, { as: 'taskAssignments', foreignKey: 'userId' });
Task.hasMany(TaskAssignees, { as: 'taskAssignments', foreignKey: 'taskId' });

// User-Project (Many-to-Many through ProjectMembers)
User.belongsToMany(Project, { through: ProjectMembers, as: 'projects', foreignKey: 'userId' });
Project.belongsToMany(User, { through: ProjectMembers, as: 'members', foreignKey: 'projectId' });

// Explicit join table associations for ProjectMembers
ProjectMembers.belongsTo(User, { as: 'user', foreignKey: 'userId' });
ProjectMembers.belongsTo(Project, { as: 'project', foreignKey: 'projectId' });
User.hasMany(ProjectMembers, { as: 'projectMemberships', foreignKey: 'userId' });
Project.hasMany(ProjectMembers, { as: 'projectMemberships', foreignKey: 'projectId' });

export { User, Task, Project, Comment, TaskAssignees, ProjectMembers };

