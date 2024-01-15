import { Canister, Err, None, Ok, Opt, Principal, Record, Result, Some, StableBTreeMap, Variant, Vec, ic, nat64, query, text, update, bool } from 'azle';

enum JobStatus {
    PENDING,
    IN_PROGRESS,
    COMPLETED,
    APPROVED,
}

enum UserRole {
    TALENT,
    CLIENT,
}

// Define interfaces for talents, jobs, and clients
interface Talent = {
    id: Principal,
    role: UserRole.TALENT,
    name: text,
    skills: Vec(text),
    hourlyRate: Opt(nat64),
    completedJobs: Vec(text),
    totalRating: Opt(nat64),
    totalEarned: Opt(nat64),
    feedbacks: Vec(Principal),
};
interface TalentPayload = {
    name: text,
    hourlyRate: nat64,
};

interface Feedback = {
    id: Principal,
    feedback: text,
}

interface Job = {
    id: text,
    title: text,
    description: text,
    owner: Principal,
    budget: nat64,
    bids: Vec(Record({ talentId: Principal, bidText: text, bidAmount: nat64 })),
    assignedTalent: Opt(Principal),
    status: JobStatus,
    clientRating: Opt(nat64),
    clientFeedback: Opt(Principal),
};
interface JobPayload = {
    title: text,
    description: text,
    budget: nat64,
};
  
interface Client = {
    id: Principal,
    name: text,
    completedJobs: Vec(text),
    totalSpent: Opt(nat64),
    feedbacks: Vec(Principal),
};
interface ClientPayload = {
    name: text,
};
  
// Initialize storages
const talentStorage = StableBTreeMap(Principal, Talent, 0);
const jobStorage = StableBTreeMap(text, Job, 1);
const clientStorage = StableBTreeMap(Principal, Client, 2);
const feedbackStorage = StableBTreeMap(Principal, Feedback, 3);

// Initialize error variants.
const Error = Variant({
    NotFound: text,
    Unauthorized: text,
    Forbidden: text,
    BadRequest: text,
    InternalError: text,
});

export default Canister({
    get
});

