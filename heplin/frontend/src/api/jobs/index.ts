import { job, jobs } from './data';
import { deepCopy } from 'src/utils/deep-copy';
import { applyPagination } from 'src/utils/apply-pagination';
import { applySort } from 'src/utils/apply-sort';
import { JobPost } from 'src/types/jobPost/jobPost';

type GetJobPostsRequest = {
  filters?: {
    query?: string;
    status?: string;
  };
  page?: number;
  rowsPerPage?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
};

type GetJobPostsResponse = Promise<{
  data: JobPost[];
  count: number;
}>;

type GetJobPostRequest = object;
type GetJobPostResponse = Promise<JobPost>;

class JobsApi {
  getJobPosts(request: GetJobPostsRequest = {}): GetJobPostsResponse {
    const { filters, page, rowsPerPage, sortBy, sortDir } = request;

    let data = deepCopy(jobs) as JobPost[];
    let count = data.length;

    if (typeof filters !== 'undefined') {
      data = data.filter((job) => {
        if (typeof filters.query !== 'undefined' && filters.query !== '') {
          // Checks only the job number, but can be extended to support other fields, such as customer
          // name, email, etc.
          // FIXME: fix contains query below
          const containsQuery = (job.status || '')
            .toLowerCase()
            .includes(filters.query.toLowerCase());

          if (!containsQuery) {
            return false;
          }
        }

        if (typeof filters.status !== 'undefined') {
          const statusMatched = job.status === filters.status;

          if (!statusMatched) {
            return false;
          }
        }

        return true;
      });
      count = data.length;
    }

    if (typeof sortBy !== 'undefined' && typeof sortDir !== 'undefined') {
      data = applySort(data, sortBy, sortDir);
    }

    if (typeof page !== 'undefined' && typeof rowsPerPage !== 'undefined') {
      data = applyPagination(data, page, rowsPerPage);
    }

    return Promise.resolve({
      data,
      count,
    });
  }

  getOrder(request?: GetJobPostRequest): GetJobPostResponse {
    return Promise.resolve(deepCopy(job));
  }
}

export const jobsApi = new JobsApi();
