import { Octokit } from '@octokit/rest';
import { GetResponseTypeFromEndpointMethod } from '@octokit/types';

const octokit = new Octokit();
type GetCommitResponseType = GetResponseTypeFromEndpointMethod<
  typeof octokit.rest.repos.getCommit
>;
export type CommitType = GetCommitResponseType['data'];
