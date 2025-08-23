const User = require('../models/User');
const Application = require('../models/Application');

const Campaign = require('../models/Campaign')


// Get all campaigns for the authenticated brand
exports.getAllCampaignsForABrand = async (req, res) => {
  try {
    // Get the authenticated brand's ID from the bearer token (user info stored in req.user)
    const brandId = req.user.userId; // Assuming the brand's ID is stored as 'userId' in the token

    // Find the brand and check if it exists (this is an extra validation step)
    const brand = await User.findById(brandId);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    console.log(brand)
    // Fetch all campaigns associated with the authenticated brand
    const campaigns = await Campaign.find({ brand: brandId })
      .sort({ createdAt: -1 }) // Sort campaigns by creation date (latest first)
      .populate('brand', 'name companyName'); // Populate brand details if needed

    // If no campaigns exist for the brand
    if (campaigns.length === 0) {
      return res.status(200).json({ message: 'No campaigns found for this brand' });
    }
    console.log(campaigns)
    // Return the list of campaigns
    res.status(200).json({
      success: true,
      campaigns,
    });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to fetch campaigns for the brand',
      error: err.message,
    });
  }
};

// Brand reviews and accepts/rejects an influencer's application
exports.reviewApplication = async (req, res) => {
  try {
    const { applicationId, status } = req.body;  // Expected status: 'accepted' or 'rejected'
    const application = await Application.findById(applicationId)
      .populate('campaign')
      .populate('influencer');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Validate the new status
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Update the application status
    application.status = status;
    await application.save();

    // If accepted, add influencer to the campaign's influencers list
    if (status === 'accepted') {
      await Campaign.updateOne(
        { _id: application.campaign._id },
        {
          $push: {
            influencers: {
              userId: application.influencer._id,
              status: 'accepted',
              phases: {
                planning: { tasks: [], completed: false },
                ongoing: { startDate: null, endDate: null },
                completed: { deliverables: [], completedAt: null },
              },
              appliedAt: application.appliedAt,
            }
          }
        }
      );
    }

    // Send response
    res.status(200).json({
      message: `Application ${status}`,
      application
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to review application', error: err.message });
  }
};


// Get all applications for a campaign
exports.getAllApplicationsForCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params; // Get campaignId from URL params
    
    // Find the campaign and check if it exists
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Fetch all applications related to this campaign, populate influencer details
    const applications = await Application.find({ campaign: campaignId })
      .populate('influencer', 'name email')  // Populate influencer details
      .sort({ createdAt: -1 }); // You can sort by creation date or any other field
    
    // Return the applications along with campaign data
    res.status(200).json({
      success: true,
      campaignTitle: campaign.title,
      campaignDescription: campaign.description,
      applications
    });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to fetch applications for the campaign',
      error: err.message
    });
  }
};
