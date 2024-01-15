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
    createdAt: nat64,
    updatedAt: nat64,
};
interface TalentInfo = {
	id: Principal,
    name: text,
    skills: Vec(text),
    hourlyRate: nat64,
    completedJobs: Vec(text),
    avgRating: nat64,
    totalEarned: nat64,
    feedbacks: Vec(Principal),
}
interface TalentPayload = {
    name: text,
    hourlyRate: nat64,
};

interface Feedback = {
    id: Principal,
    feedback: text,
	owner: Principal,
    createdAt: nat64,
    updatedAt: nat64,
};
interface FeedbackInfo = {
    id: Principal,
    feedback: text,
};

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
    createdAt: nat64,
    updatedAt: nat64,
};
interface JobInfo = {
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
}
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
    createdAt: nat64,
    updatedAt: nat64,
};
interface ClientInfo = {
    id: Principal,
    name: text,
    completedJobs: Vec(text),
    totalSpent: Opt(nat64),
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
    getProfileInfo: query([], Result(TalentInfo | ClientInfo, Error), () => {
		try{
			let user = talentStorage.get(ic.caller());
			if ('None' in user) {
				user = clientStorage.get(ic.caller());
			}

			if ('None' in user) {
				return Err({ Unauthorized: 'Create an account first.' });
			}
			
			if(user.role === UserRole.TALENT){
				const avgRtn = Math.ceil(user.totalRating / user.completedJobs.length());
				return {
					id: ic.caller(),
					name: user.name,
					skills: user.skills,
					hourlyRate: user.hourlyRate,
					completedJobs: user.completedJobs,
					avgRating: avgRtn,
					totalEarned: user.totalEarned,
					feedbacks: user.feedbacks,
				};
			}

			if(user.role === UserRole.CLIENT){
				return {
					id: ic.caller(),
					name: user.name,
					completedJobs: user.completedJobs,
					totalSpent: user.totalSpent,
					feedbacks: user.feedbacks,
				};
			}

			return Err({ Unauthorized: 'Create an account first.' });
		}catch(error){
			// Handle Errors
            return Err({ InternalError: `${error}` });
		}
	}),

    addTalent: update([TalentPayload], Result(Talent, Error), (payload) => {
        try {
            // If talent already exists, return error.
            if (talentStorage.containsKey(ic.caller())) {
                return Err({ BadRequest: 'You already have a talent account' });
            }

            // Create new talent
            talentStorage.insert(ic.caller(), {
                id: ic.caller(),
                role: UserRole.TALENT,
                name: payload.name,
                skills: [],
                hourlyRate: None,
                completedJobs: [],
                totalRating: None,
                totalEarned: None,
                feedbacks: [],
                createdAt: ic.time(),
                updatedAt: ic.time(),
            });

            return Ok(talentStorage.get(ic.caller()));
        } catch (error) {
            // Handle Errors
            return Err({ InternalError: `${error}` });
        }
    }),

	
});

