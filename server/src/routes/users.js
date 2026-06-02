import { Router } from 'express';
import * as userController from '../controllers/userController.js';

const router = Router();

router.get('/:username/repos/:repoName', userController.getRepoDetail);
router.get('/:username/repos', userController.getRepos);
router.get('/:username', userController.getProfile);

export default router;
