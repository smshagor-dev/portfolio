export function sortProjectsByRecency(projects = []) {
  return [...projects].sort((left, right) => {
    const leftTimestamp = getProjectTimestamp(left);
    const rightTimestamp = getProjectTimestamp(right);

    if (leftTimestamp !== rightTimestamp) {
      return rightTimestamp - leftTimestamp;
    }

    return Number(right?.id || 0) - Number(left?.id || 0);
  });
}

function getProjectTimestamp(project) {
  const value = project?.createdAt || project?.updatedAt || project?.date;
  const timestamp = value ? new Date(value).getTime() : NaN;

  if (Number.isFinite(timestamp)) {
    return timestamp;
  }

  return Number(project?.id || 0);
}
