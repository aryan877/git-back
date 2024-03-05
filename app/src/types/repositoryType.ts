import { Octokit } from '@octokit/rest';
import { GetResponseTypeFromEndpointMethod } from '@octokit/types';

const octokit = new Octokit();
type RepositoryResponseType = GetResponseTypeFromEndpointMethod<
  typeof octokit.rest.repos.get
>;
export type RepositoryType = RepositoryResponseType['data'];
